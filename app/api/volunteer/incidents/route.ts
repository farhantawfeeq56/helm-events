import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { Task } from "@/models/task";
import { IncidentMessage } from "@/models/incident-message";
import { getActiveEvent } from "@/lib/context/contextService";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

const ACTIVE_STATUSES = ["open", "investigating", "mitigated"];

/** Stringify a Hermes impact item (string or object) into a short awareness line. */
function impactLine(item: unknown): string | null {
  if (!item) return null;
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    const o = item as Record<string, unknown>;
    const v = o.description || o.title || o.text || o.label;
    return typeof v === "string" ? v : null;
  }
  return null;
}

/**
 * Incidents relevant to the signed-in volunteer: everything operational on the
 * active event (plus event-less Hermes logs), sanitized to a field briefing —
 * no organizer-only response strategy or external comms drafts. Includes this
 * volunteer's acknowledgement state, whether they hold a related task, and the
 * coordination message count.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    const me = session?.name || "";

    const event = await getActiveEvent().catch(() => null);
    const eventId = event?._id ? String(event._id) : null;

    // Event-scoped incidents plus unscoped agent logs (still operationally relevant).
    const filter = eventId
      ? { $or: [{ eventId: new Types.ObjectId(eventId) }, { eventId: { $exists: false } }, { eventId: null }] }
      : {};

    const docs = (await Incident.find(filter).sort({ createdAt: -1 }).limit(100).lean()) as Array<{
      _id: unknown;
      eventId?: unknown;
      type?: string;
      title?: string;
      slug?: string;
      severity?: string;
      description?: string;
      status?: string;
      reportedAt?: unknown;
      createdAt?: unknown;
      source?: string;
      analysis?: Record<string, unknown>;
      acknowledgedBy?: Array<{ name: string; role?: string; at?: unknown }>;
    }>;

    const ids = docs.map((d) => d._id as Types.ObjectId);

    // Which of these incidents the volunteer has a task on (strong relevance signal).
    const relatedIncidentIds = new Set<string>();
    if (me && ids.length) {
      const tasks = (await Task.find({ assignedTo: me, incidentId: { $in: ids } })
        .select("incidentId")
        .lean()) as Array<{ incidentId?: unknown }>;
      for (const t of tasks) if (t.incidentId) relatedIncidentIds.add(String(t.incidentId));
    }

    // Coordination message counts per incident in one pass.
    const coordCounts = new Map<string, number>();
    if (ids.length) {
      const agg = (await IncidentMessage.aggregate([
        { $match: { incidentId: { $in: ids } } },
        { $group: { _id: "$incidentId", count: { $sum: 1 } } },
      ])) as Array<{ _id: unknown; count: number }>;
      for (const r of agg) coordCounts.set(String(r._id), r.count);
    }

    const incidents = docs.map((d) => {
      const id = String(d._id);
      const analysis = d.analysis || {};
      const impactRaw = Array.isArray(analysis.impactAnalysis) ? analysis.impactAnalysis : [];
      const acks = Array.isArray(d.acknowledgedBy) ? d.acknowledgedBy : [];
      return {
        id,
        // Unified key for the activity timeline (aligns with organizer/Hermes logs).
        activityKey: d.slug || id,
        title: d.title || d.type || "Incident",
        type: d.type || "Incident",
        severity: (d.severity || "medium").toLowerCase(),
        status: (d.status || "open").toLowerCase(),
        description: (typeof analysis.situation === "string" ? analysis.situation : d.description) || "",
        location: typeof analysis.location === "string" ? analysis.location : "",
        reportedAt: d.reportedAt || d.createdAt || null,
        source: d.source || "manual",
        impactPoints: impactRaw.map(impactLine).filter((x): x is string => Boolean(x)).slice(0, 3),
        acknowledgedByYou: me ? acks.some((a) => a.name === me) : false,
        acknowledgedCount: acks.length,
        acknowledgedNames: acks.slice(0, 5).map((a) => a.name),
        relatedToYou: relatedIncidentIds.has(id),
        coordinationCount: coordCounts.get(id) || 0,
      };
    });

    // Active incidents first (by severity), resolved/closed sink to the bottom.
    const sevRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    incidents.sort((a, b) => {
      const aActive = ACTIVE_STATUSES.includes(a.status) ? 0 : 1;
      const bActive = ACTIVE_STATUSES.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9);
    });

    return NextResponse.json({ success: true, data: incidents, eventName: event?.name || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch incidents.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
