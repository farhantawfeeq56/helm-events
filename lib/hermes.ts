// ─── Core primitives ────────────────────────────────────────────────────────

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface ChecklistItem {
  text: string;
  status: "pending" | "in-progress" | "completed";
}

// ─── StrategyOrchestrator: response options ──────────────────────────────────

export interface RecommendedAction {
  id: number;
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  operationalConsiderations: string;
  status: "pending" | "approved" | "modified";
  priority: "high" | "medium" | "low";
  steps?: ChecklistItem[];
}

// ─── IncidentIntelligence: risk & comms ─────────────────────────────────────

export interface RiskAssessment {
  level: Severity;
  explanation: string;
  mitigationStrategy: string;
}

export interface CommunicationPlan {
  id: number;
  channel: "SMS" | "Push" | "Email" | "Radio";
  audience: string;
  message: string;
  status: "draft" | "sent";
}

// ─── OperationalCard (IncidentIntelligence output) ──────────────────────────

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  timestamp: string;
  description: string;
  impactAnalysis: string[];
  responseOptions?: RecommendedAction[];
  riskAssessment?: RiskAssessment;
  communications?: CommunicationPlan[];
  executionStatus: string;
  iconName: string;
  color: string;
}

// ─── FieldIntelligence: issue reports ───────────────────────────────────────

export interface ReportedIssue {
  id: string;
  category: "Technical" | "Medical" | "Security" | "Facility" | "Logistics" | "General";
  description: string;
  location: string;
  severity: Severity;
  extractedSignals: string[];
  guidance: string;
  status: string;
  timestamp: string;
}

// ─── HermesRequest ──────────────────────────────────────────────────────────

export interface HermesRequest {
  message: string;
  role?: string;
}

// ─── HermesResponse union (maps directly to agent JSON output) ──────────────
// Each variant maps to a specific UI component in components/agent/:
//   text              → MessageItem (plain prose — used for explanatory/meta
//                       answers; NOT everything should be structured JSON)
//   clarification     → ClarificationCard (agent needs more detail before acting)
//   operational-card  → OperationalCard + ImpactAnalysis + RiskAssessment
//                       + ResponseOptions + CommunicationPlan
//   execution-checklist → ExecutionChecklist
//   issue-report      → IssueReportCard

export type HermesResponse =
  | { type: "text"; content: string }
  | { type: "clarification"; content: string; questions: string[] }
  | { type: "operational-card"; content: string; incidentData: Incident }
  | { type: "execution-checklist"; content: string; checklist: ChecklistItem[] }
  | { type: "issue-report"; content: string; reportData: ReportedIssue };

/**
 * Defensive cleanup for `text`-typed agent replies. The agent should send prose
 * for conversational/explanatory answers, but if it wraps a reply in a ```json
 * fence or hands back a bare JSON object, we unwrap it to the human-readable
 * field rather than leaking raw JSON to the operator. Pure (no imports) so it
 * runs in both the server handler and the client renderer. Never returns a fence.
 */
export function sanitizeAgentText(raw: string): string {
  if (!raw) return raw;
  let s = raw.trim();

  // Strip a single surrounding markdown code fence: ```json … ``` or ``` … ```
  const fence = s.match(/^```(?:json|JSON)?\s*([\s\S]*?)\s*```$/);
  if (fence) s = fence[1].trim();

  // If what remains is a JSON object, surface a human-readable field from it
  // instead of showing the operator raw JSON.
  if (s.startsWith("{") && s.endsWith("}")) {
    try {
      const obj = JSON.parse(s);
      for (const key of ["content", "message", "text", "answer", "response", "summary"]) {
        const v = (obj as Record<string, unknown>)[key];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
    } catch {
      // not valid JSON — fall through and return the de-fenced text
    }
  }
  return s;
}

// ─── SSE event types from the bridge API ────────────────────────────────────

export type HermesSSEEvent =
  | { type: "progress"; content: string }
  | { type: "complete"; payload: HermesResponse };

// ─── Mock incidents (used as fallback when HERMES_AGENT_URL is not set) ─────

export const mockIncidents: Incident[] = [
  {
    id: "speaker-delay",
    title: "Speaker Delay",
    severity: "High",
    status: "Investigating",
    timestamp: "10m ago",
    description: "Keynote speaker Dr. Sarah Chen is stuck in traffic and will be 20 minutes late for her 10:00 AM session.",
    impactAnalysis: ["Main Stage Schedule", "Attendee Flow", "Live Stream Timing"],
    responseOptions: [
      {
        id: 1,
        title: "Push back keynote by 20 minutes",
        summary: "Shift the entire Main Stage schedule by 20 minutes to allow the keynote speaker to deliver her full presentation.",
        pros: ["Ensures all attendees see the full keynote", "Reduces speaker stress"],
        cons: ["Impacts lunch break timing", "May cause conflicts for attendees with afternoon meetings"],
        operationalConsiderations: "Requires immediate coordination with catering to delay lunch service by 20 minutes.",
        status: "pending",
        priority: "high",
        steps: [
          { text: "Coordinate with catering for lunch delay", status: "completed" },
          { text: "Update Main Stage AV schedule", status: "in-progress" },
          { text: "Notify session moderators", status: "pending" },
        ],
      },
      {
        id: 2,
        title: "Extend morning networking break",
        summary: "Keep attendees in the networking area for an additional 20 minutes while the speaker arrives and sets up.",
        pros: ["Increases networking opportunities", "Maintains high energy in the expo hall"],
        cons: ["May lead to attendee restlessness", "Crowding in the coffee area"],
        operationalConsiderations: "Request additional coffee and snacks from catering for the extended period.",
        status: "pending",
        priority: "medium",
        steps: [
          { text: "Request additional coffee/snacks from catering", status: "completed" },
          { text: "Inform expo hall staff of extension", status: "in-progress" },
          { text: "Monitor crowd density in coffee areas", status: "pending" },
        ],
      },
      {
        id: 3,
        title: "Notify attendees via mobile app",
        summary: "Send a real-time push notification to all attendees informing them of the schedule change.",
        pros: ["Provides immediate transparency", "Reduces confusion at the Main Stage doors"],
        cons: ["May cause minor frustration for early-arriving attendees"],
        operationalConsiderations: "Draft the message to focus on the 'extra networking time' to keep the tone positive.",
        status: "pending",
        priority: "high",
        steps: [
          { text: "Draft push notification message", status: "completed" },
          { text: "Get approval from Event Director", status: "completed" },
          { text: "Schedule push notification in CMS", status: "in-progress" },
        ],
      },
    ],
    riskAssessment: {
      level: "Medium",
      explanation: "Delay might cascade into afternoon sessions if not managed properly.",
      mitigationStrategy: "Tighten transition times between subsequent sessions to regain schedule alignment.",
    },
    communications: [
      { id: 1, channel: "Push", audience: "All Attendees", message: "Keynote start time adjusted to 10:20 AM. Enjoy the extended networking!", status: "draft" },
      { id: 2, channel: "SMS", audience: "Event Staff", message: "Dr. Chen delayed. Push back Main Stage schedule by 20m. Update room signs.", status: "draft" },
    ],
    executionStatus: "Awaiting approval for schedule adjustment.",
    iconName: "Clock",
    color: "amber",
  },
  {
    id: "internet-outage",
    title: "Internet Outage",
    severity: "Critical",
    status: "Investigating",
    timestamp: "5m ago",
    description: "Wi-Fi connectivity lost in Hall B, affecting several workshops and live demos.",
    impactAnalysis: ["Workshop Connectivity", "Demo Performance", "Attendee Experience"],
    responseOptions: [
      {
        id: 8,
        title: "Switch to backup cellular hotspots",
        summary: "Deploy portable 5G hotspots to critical demo stations in Hall B to restore immediate connectivity.",
        pros: ["Restores critical demo functionality", "Independent of venue infrastructure"],
        cons: ["Limited bandwidth compared to fiber Wi-Fi", "Requires manual setup at each booth"],
        operationalConsiderations: "Prioritize booths with scheduled live presentations over general expo stalls.",
        status: "pending",
        priority: "high",
        steps: [
          { text: "Retrieve 5G hotspots from storage", status: "completed" },
          { text: "Deploy to Hall B demo stations 1-5", status: "in-progress" },
          { text: "Verify connectivity at each station", status: "pending" },
        ],
      },
      {
        id: 9,
        title: "Contact venue IT department",
        summary: "Escalate the issue to the venue's lead network engineer to identify if it's a local hardware failure or ISP outage.",
        pros: ["Addresses the root cause", "Necessary for long-term resolution"],
        cons: ["Resolution time is outside of our direct control"],
        operationalConsiderations: "Ask for an ETR (Estimated Time to Repair) every 15 minutes to manage expectations.",
        status: "pending",
        priority: "high",
        steps: [
          { text: "Initiate emergency IT support ticket", status: "completed" },
          { text: "Conference call with ISP lead", status: "in-progress" },
          { text: "Receive ETR and report back", status: "pending" },
        ],
      },
      {
        id: 10,
        title: "Post status update on event portal",
        summary: "Add a notice to the digital signage and event app acknowledging the issue and providing progress updates.",
        pros: ["Reduces support requests", "Shows proactive management"],
        cons: ["Increases awareness of the failure among unaffected attendees"],
        operationalConsiderations: "Keep updates brief and focused on the actions being taken.",
        status: "pending",
        priority: "medium",
        steps: [
          { text: "Draft outage acknowledgment message", status: "completed" },
          { text: "Push update to event mobile app", status: "in-progress" },
          { text: "Update digital signage in Hall B", status: "pending" },
        ],
      },
    ],
    riskAssessment: {
      level: "High",
      explanation: "Multiple sessions rely on internet; downtime significantly impacts session quality.",
      mitigationStrategy: "Deploy portable 5G hotspots to critical demo booths immediately.",
    },
    communications: [
      { id: 5, channel: "Push", audience: "Hall B Attendees", message: "We are experiencing Wi-Fi issues in Hall B. Our team is working on a fix.", status: "draft" },
      { id: 6, channel: "Radio", audience: "All Staff", message: "Code Red: Internet outage in Hall B. Deploy hotspots to primary demo stations.", status: "sent" },
    ],
    executionStatus: "Venue IT investigating fiber line.",
    iconName: "WifiHigh",
    color: "red",
  },
];
