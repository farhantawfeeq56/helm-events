import { Types } from "mongoose";
import { Incident, TimelineEvent, Risk } from "@/types/incident";
import { type Incident as HermesIncident } from "@/lib/hermes";
import { connectToDatabase } from "@/lib/db";
import { Incident as IncidentModel } from "@/models/incident";

/**
 * INCIDENT REPOSITORY
 *
 * Central adapter between the persisted incident documents (MongoDB) and the
 * rich UI `Incident` type. There is no mock/fallback data: reads come straight
 * from the database, and the detail sections (timeline, risks, resources) are
 * *derived* from real records — the activity log and the incident's own Hermes
 * analysis — rather than fabricated. Sections with no underlying data render
 * empty rather than inventing rows.
 */

// ─── MongoDB ⇆ UI mapping ───────────────────────────────────────────────────

const SEVERITY_LABELS: Record<string, Incident["severity"]> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function toSeverityLabel(raw: string | undefined): Incident["severity"] {
  if (!raw) return "Medium";
  return SEVERITY_LABELS[raw.toLowerCase()] ?? (raw as Incident["severity"]);
}

function severityColor(raw: string | undefined): string {
  switch ((raw ?? "").toLowerCase()) {
    case "critical": return "red";
    case "high": return "orange";
    case "medium": return "amber";
    default: return "blue";
  }
}

function formatTimestamp(value: unknown): string {
  if (!value) return "Just now";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Derive a single Risk row from the agent's risk assessment, if present. */
function risksFromAnalysis(a: HermesIncident | undefined): Risk[] {
  const ra = a?.riskAssessment;
  if (!ra) return [];
  const level = (ra.level?.toLowerCase() as "high" | "medium" | "low") || "medium";
  return [
    {
      id: "risk-assessment",
      title: ra.explanation || "Risk assessment",
      probability: level,
      impact: level,
      mitigation: ra.mitigationStrategy || "No mitigation strategy defined.",
    },
  ];
}

/** A persisted incident document shape (lean), loosely typed. */
type IncidentDoc = {
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
  analysis?: HermesIncident;
};

/**
 * Maps a MongoDB incident document to the rich UI `Incident` type.
 * Hermes-sourced incidents carry a full `analysis` payload (impact, response
 * options, risk assessment, comms); manually-created ones map to sensible
 * defaults. Timeline/affectedResources are left empty here and derived
 * separately on the detail path (see `getIncidentById`).
 */
function mapDocToIncident(doc: IncidentDoc): Incident {
  const eventId = doc.eventId ? String(doc.eventId) : "live-session";

  if (doc.analysis && typeof doc.analysis === "object") {
    const a = doc.analysis;
    return {
      ...a,
      id: doc.slug || a.id || String(doc._id),
      situation: a.description ?? doc.description ?? "",
      affectedResources: [],
      timeline: [],
      risks: risksFromAnalysis(a),
      eventId,
    };
  }

  return {
    id: doc.slug || String(doc._id),
    title: doc.title || doc.type || "Incident",
    severity: toSeverityLabel(doc.severity),
    status: doc.status || "open",
    timestamp: formatTimestamp(doc.reportedAt || doc.createdAt),
    description: doc.description || "",
    situation: doc.description || "",
    impactAnalysis: [],
    affectedResources: [],
    timeline: [],
    risks: [],
    executionStatus: "Logged in the operations system.",
    iconName: "Warning",
    color: severityColor(doc.severity),
    eventId,
  };
}

// ─── Timeline derivation (from the real activity log) ───────────────────────

/** Map an activity action onto a timeline event category. */
function timelineType(action: string): TimelineEvent["type"] {
  const a = (action || "").toLowerCase();
  if (a.includes("report") || a.includes("create")) return "incident_report";
  if (a.includes("resolve") || a.includes("close")) return "resolution";
  if (a.includes("plan") || a.includes("assign") || a.includes("mitigat") || a.includes("dispatch")) return "mitigation";
  if (a.includes("notif") || a.includes("comm") || a.includes("message")) return "communication";
  return "investigation";
}

function humanizeAction(action: string): string {
  return (action || "Activity")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds the incident timeline from real `Activity` entries targeting this
 * incident (`target = "incident:<slug>"`). Newest-last so the detail view reads
 * top-to-bottom in chronological order. Empty when nothing has been logged yet.
 */
async function deriveTimeline(slug: string | undefined): Promise<TimelineEvent[]> {
  if (!slug) return [];
  try {
    const { Activity } = await import("@/models/activity");
    const entries = (await Activity.find({ target: `incident:${slug}` })
      .sort({ timestamp: 1 })
      .limit(50)
      .lean()) as Array<{
        _id: unknown;
        action?: string;
        details?: string;
        user?: string;
        timestamp?: unknown;
        createdAt?: unknown;
      }>;

    return entries.map((e) => ({
      id: String(e._id),
      timestamp: formatTimestamp(e.timestamp || e.createdAt),
      title: humanizeAction(e.action || "Activity"),
      description: e.details || "",
      type: timelineType(e.action || ""),
      status: "completed" as const,
    }));
  } catch (error) {
    console.error("deriveTimeline failed:", error);
    return [];
  }
}

// ─── Reads (DB-only) ────────────────────────────────────────────────────────

export async function getAllIncidents(): Promise<Incident[]> {
  await connectToDatabase();
  const docs = (await IncidentModel.find().sort({ createdAt: -1 }).lean()) as IncidentDoc[];
  return docs.map(mapDocToIncident);
}

/**
 * Fetches a single incident by its URL id — the Hermes slug (kebab-case) or a
 * Mongo ObjectId — and enriches it with a timeline derived from the activity
 * log. Returns undefined when no such incident exists (callers handle 404).
 */
export async function getIncidentById(id: string): Promise<Incident | undefined> {
  await connectToDatabase();
  let doc = (await IncidentModel.findOne({ slug: id }).lean()) as IncidentDoc | null;
  if (!doc && Types.ObjectId.isValid(id)) {
    doc = (await IncidentModel.findById(id).lean()) as IncidentDoc | null;
  }
  if (!doc) return undefined;

  const incident = mapDocToIncident(doc);
  incident.timeline = await deriveTimeline(doc.slug || incident.id);
  return incident;
}

export async function getIncidentsByStatus(status: string): Promise<Incident[]> {
  const all = await getAllIncidents();
  return all.filter((incident) => incident.status.toLowerCase() === status.toLowerCase());
}

export async function getIncidentsByEventId(eventId: string): Promise<Incident[]> {
  const all = await getAllIncidents();
  return all.filter((incident) => incident.eventId === eventId);
}

// ─── Writes (Hermes → MongoDB) ──────────────────────────────────────────────

/**
 * Persists an incident produced by the Hermes agent. Idempotent on the agent's
 * slug id — re-running an analysis updates the stored record rather than
 * duplicating it. Attaches the active event when one exists. Never throws: a
 * persistence failure must not break the chat stream (the incident still lives
 * in client state/localStorage as a fallback).
 */
export async function persistHermesIncident(data: HermesIncident): Promise<void> {
  try {
    await connectToDatabase();
    const { getActiveEvent } = await import("@/lib/context/contextService");

    const activeEvent = await getActiveEvent().catch(() => null);
    const eventId = activeEvent?._id ? String(activeEvent._id) : undefined;

    const core = {
      eventId,
      type: data.title,
      title: data.title,
      severity: data.severity.toLowerCase(),
      description: data.description,
      status: (data.status || "open").toLowerCase(),
      source: "hermes" as const,
      analysis: data,
    };

    const existing = await IncidentModel.findOne({ slug: data.id });
    if (existing) {
      Object.assign(existing, core);
      existing.markModified("analysis");
      await existing.save();
      return;
    }

    await IncidentModel.create({ ...core, slug: data.id, reportedAt: new Date() });
  } catch (error) {
    console.error("persistHermesIncident failed:", error);
  }
}
