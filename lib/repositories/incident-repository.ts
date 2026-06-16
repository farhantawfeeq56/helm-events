import { Types } from "mongoose";
import { Incident } from "@/types/incident";
import { mockIncidents as hermesMockIncidents, type Incident as HermesIncident } from "@/lib/hermes";
import { connectToDatabase } from "@/lib/db";
import { Incident as IncidentModel } from "@/models/incident";
import { getActiveEvent } from "@/lib/context/contextService";

/**
 * INCIDENT REPOSITORY
 * 
 * This module acts as the central adapter layer for incident data.
 * 
 * FUTURE GCP INTEGRATION:
 * 1. Firestore: MOCK_INCIDENTS will be replaced by a Firestore collection reference.
 *    - State persistence will move from memory to Firestore.
 *    - Real-time updates will be handled via onSnapshot listeners.
 * 
 * 2. Vertex AI (GCP):
 *    - When a new incident is reported, a trigger will invoke the `bridge-cf` Cloud Function.
 *    - Hermes (Gemini 1.5 Pro) will analyze the incident and populate:
 *      - situation (summarized from logs)
 *      - impactAnalysis (cascading effects)
 *      - riskAssessment (probability/impact)
 *      - responseOptions (recommended actions)
 *      - communications (drafted messages)
 * 
 * 3. Tool Calling:
 *    - Approved ResponseOptions will trigger downstream Cloud Functions to update
 *      schedules, notify staff, or adjust resources.
 */
const MOCK_INCIDENTS: Incident[] = hermesMockIncidents.map((incident) => ({
  ...incident,
  situation: incident.description, // Initial fallback
  eventId: "event-1", // Default event ID for now
  affectedResources: [
    {
      id: "res-1",
      name: "Main Stage",
      type: "room",
      impact: incident.severity === "Critical" ? "high" : "medium",
      status: "Active",
    },
    {
      id: "res-2",
      name: "All Staff",
      type: "speaker",
      impact: "low",
      status: "Notified",
    }
  ],
  timeline: [
    {
      id: "tm-1",
      timestamp: incident.timestamp,
      title: "Incident Reported",
      description: incident.description,
      type: "incident_report",
      status: "completed",
    },
    {
      id: "tm-2",
      timestamp: "5m later",
      title: "Initial Assessment",
      description: "Automated impact analysis completed by Hermes.",
      type: "investigation",
      status: "completed",
    }
  ],
  risks: [
    {
      id: "risk-1",
      title: incident.riskAssessment?.explanation || "Assessment pending",
      probability: "medium",
      impact: (incident.riskAssessment?.level?.toLowerCase() as "high" | "medium" | "low") || "medium",
      mitigation: incident.riskAssessment?.mitigationStrategy || "No mitigation strategy defined",
    },
  ],
}));

// Add some more realistic data for one of the incidents to show off the UI
const speakerDelayIncident = MOCK_INCIDENTS.find(i => i.id === "speaker-delay");
if (speakerDelayIncident) {
  speakerDelayIncident.situation = "Dr. Sarah Chen is delayed due to a multi-vehicle accident on I-95. She is safe but currently immobile and will not arrive for at least 30-40 minutes.";
  speakerDelayIncident.affectedResources = [
    { id: "room-main", name: "Main Stage", type: "room", impact: "high", status: "In Use" },
    { id: "speaker-sarah", name: "Dr. Sarah Chen", type: "speaker", impact: "high", status: "Delayed" },
    { id: "session-keynote", name: "Opening Keynote", type: "session", impact: "high", status: "Pending" },
  ];
  speakerDelayIncident.timeline = [
    {
      id: "tm-1",
      timestamp: "09:45 AM",
      title: "Delay Reported",
      description: "Speaker's driver notified event staff of traffic delay.",
      type: "incident_report",
      status: "completed",
    },
    {
      id: "tm-2",
      timestamp: "09:50 AM",
      title: "Impact Assessment",
      description: "Hermes analyzed schedule and identified cascading delays for 3 subsequent sessions.",
      type: "investigation",
      status: "completed",
    },
    {
      id: "tm-3",
      timestamp: "09:55 AM",
      title: "Response Plan Drafted",
      description: "Communication plan and schedule adjustments prepared.",
      type: "investigation",
      status: "completed",
    },
    {
      id: "tm-4",
      timestamp: "10:00 AM",
      title: "Executing Communications",
      description: "Push notifications being dispatched to attendees.",
      type: "communication",
      status: "in-progress",
    },
  ];
  speakerDelayIncident.risks = [
    {
      id: "risk-1",
      title: "Schedule Cascade",
      probability: "high",
      impact: "high",
      mitigation: "Tighten transition times between afternoon sessions.",
    },
    {
      id: "risk-2",
      title: "Attendee Dissatisfaction",
      probability: "medium",
      impact: "medium",
      mitigation: "Proactive communication via push notifications and extra refreshments.",
    },
  ];
}

const internetOutageIncident = MOCK_INCIDENTS.find(i => i.id === "internet-outage");
if (internetOutageIncident) {
  internetOutageIncident.situation = "Total loss of Wi-Fi connectivity in Hall B. This area hosts all live coding workshops and high-bandwidth demos. Primary ISP reporting a local fiber cut.";
  internetOutageIncident.affectedResources = [
    { id: "hall-b", name: "Hall B", type: "room", impact: "high", status: "Critical" },
    { id: "workshop-1", name: "Next.js Advanced Workshop", type: "session", impact: "high", status: "Interrupted" },
    { id: "sponsor-1", name: "Vercel Demo Booth", type: "sponsor", impact: "medium", status: "Affected" },
  ];
  internetOutageIncident.timeline = [
    {
      id: "tm-1",
      timestamp: "11:20 AM",
      title: "Outage Detected",
      description: "Automated network monitoring flagged Hall B gateway as offline.",
      type: "incident_report",
      status: "completed",
    },
    {
      id: "tm-2",
      timestamp: "11:22 AM",
      title: "Venue IT Notified",
      description: "Emergency ticket raised with venue engineering team.",
      type: "investigation",
      status: "completed",
    },
    {
      id: "tm-3",
      timestamp: "11:25 AM",
      title: "Hotspot Deployment",
      description: "Operations team dispatched with 5G backup units.",
      type: "mitigation",
      status: "in-progress",
    }
  ];
  internetOutageIncident.risks = [
    {
      id: "risk-1",
      title: "Sponsor SLA Breach",
      probability: "medium",
      impact: "high",
      mitigation: "Document all downtime and provide complimentary lead retrieval credits.",
    },
    {
      id: "risk-2",
      title: "Social Media Sentiment Drop",
      probability: "high",
      impact: "medium",
      mitigation: "Immediate public acknowledgement and regular updates.",
    }
  ];
}

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
 * Hermes-sourced incidents carry a full `analysis` payload; manually-created
 * ones are expanded with sensible defaults so every incident renders.
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
      risks: [],
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

// ─── Reads (DB-first, mock fallback) ────────────────────────────────────────

export async function getAllIncidents(): Promise<Incident[]> {
  try {
    await connectToDatabase();
    const docs = (await IncidentModel.find().sort({ createdAt: -1 }).lean()) as IncidentDoc[];
    if (docs.length > 0) return docs.map(mapDocToIncident);
  } catch (error) {
    console.error("getAllIncidents: DB unavailable, falling back to mock.", error);
  }
  return MOCK_INCIDENTS;
}

/**
 * Fetches a single incident by its URL id — the Hermes slug (kebab-case) or a
 * Mongo ObjectId — then falls back to the in-memory mock set.
 */
export async function getIncidentById(id: string): Promise<Incident | undefined> {
  try {
    await connectToDatabase();
    let doc = (await IncidentModel.findOne({ slug: id }).lean()) as IncidentDoc | null;
    if (!doc && Types.ObjectId.isValid(id)) {
      doc = (await IncidentModel.findById(id).lean()) as IncidentDoc | null;
    }
    if (doc) return mapDocToIncident(doc);
  } catch (error) {
    console.error("getIncidentById: DB error, falling back to mock.", error);
  }
  return MOCK_INCIDENTS.find((incident) => incident.id === id);
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
      await existing.save();
      return;
    }

    await IncidentModel.create({ ...core, slug: data.id, reportedAt: new Date() });
  } catch (error) {
    console.error("persistHermesIncident failed:", error);
  }
}
