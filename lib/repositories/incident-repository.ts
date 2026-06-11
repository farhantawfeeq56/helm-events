import { Incident } from "@/types/incident";
import { mockIncidents as hermesMockIncidents } from "@/lib/hermes";

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
  ],
  risks: [
    {
      id: "risk-1",
      title: incident.riskAssessment.explanation,
      probability: "medium",
      impact: incident.riskAssessment.level.toLowerCase() as "high" | "medium" | "low",
      mitigation: incident.riskAssessment.mitigationStrategy,
    },
  ],
}));

// Add some more realistic data for one of the incidents to show off the UI
const speakerDelayIncident = MOCK_INCIDENTS.find(i => i.id === "speaker-delay");
if (speakerDelayIncident) {
  speakerDelayIncident.situation = "Dr. Sarah Chen is delayed due to a multi-vehicle accident on I-95. She is safe but immobile.";
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
      title: "Response Options Generated",
      description: "Hermes proposed schedule shift or breakout swap.",
      type: "investigation",
      status: "completed",
    },
    {
      id: "tm-4",
      timestamp: "10:00 AM",
      title: "Awaiting Approval",
      description: "Proposed schedule shift sent to Event Director.",
      type: "mitigation",
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

export async function getAllIncidents(): Promise<Incident[]> {
  return MOCK_INCIDENTS;
}

export async function getIncidentById(id: string): Promise<Incident | undefined> {
  return MOCK_INCIDENTS.find((incident) => incident.id === id);
}

export async function getIncidentsByStatus(status: string): Promise<Incident[]> {
  return MOCK_INCIDENTS.filter((incident) => incident.status.toLowerCase() === status.toLowerCase());
}

export async function getIncidentsByEventId(eventId: string): Promise<Incident[]> {
  return MOCK_INCIDENTS.filter((incident) => incident.eventId === eventId);
}
