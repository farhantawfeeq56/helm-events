import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { logActivity } from "@/lib/activity-logger";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { maybeRecordSnapshot } from "@/lib/services/metrics-service";

/**
 * Records that the signed-in user is aware of / on this incident. Idempotent per
 * person, persisted on the incident, and logged to the activity feed so
 * organizers and Hermes see real field acknowledgement in real time.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    if (!session?.name) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    const name = session.name;
    const role = session.role || "volunteer";

    const incident = await Incident.findById(id);
    if (!incident) {
      return NextResponse.json({ success: false, error: "Incident not found" }, { status: 404 });
    }

    const acks: Array<{ name: string }> = incident.acknowledgedBy || [];
    const already = acks.some((a) => a.name === name);
    if (!already) {
      // Atomic push (avoids re-validating the whole document on save).
      await Incident.updateOne({ _id: id }, { $push: { acknowledgedBy: { name, role, at: new Date() } } });
      incident.acknowledgedBy = [...acks, { name, role, at: new Date() }];

      const title = incident.title || incident.type || "incident";
      const key = incident.slug || String(incident._id);
      const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
      await logActivity({
        user: name,
        type: "human",
        action: "incident_acknowledged",
        target: `incident:${key}`,
        details: `${name} (${roleLabel}) acknowledged incident "${title}" — aware and responding.`,
      }).catch(() => {});

      if (incident.eventId) {
        await maybeRecordSnapshot(String(incident.eventId), { trigger: "incident_acknowledged" });
      }
    }

    return NextResponse.json({
      success: true,
      acknowledgedBy: incident.acknowledgedBy,
      acknowledgedByYou: true,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to acknowledge incident" }, { status: 500 });
  }
}
