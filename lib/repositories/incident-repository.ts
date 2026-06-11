import { Incident } from "@/types/incident";
import { mockIncidents as hermesMockIncidents } from "@/lib/hermes";

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

export async function getAllIncidents(): Promise<Incident[]> {
  return MOCK_INCIDENTS;
}

/**
 * Fetches a single incident by its ID.
 * 
 * INTEGRATION POINT:
 * This will eventually fetch from Firestore and use the `bridge-cf` 
 * to check if real-time AI analysis is currently pending.
 */
export async function getIncidentById(id: string): Promise<Incident | undefined> {
  return MOCK_INCIDENTS.find((incident) => incident.id === id);
}

export async function getIncidentsByStatus(status: string): Promise<Incident[]> {
  return MOCK_INCIDENTS.filter((incident) => incident.status.toLowerCase() === status.toLowerCase());
}

export async function getIncidentsByEventId(eventId: string): Promise<Incident[]> {
  return MOCK_INCIDENTS.filter((incident) => incident.eventId === eventId);
}
