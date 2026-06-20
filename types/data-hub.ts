import type { Incident as HermesIncident } from "@/lib/hermes";

export type SpeakerStatus = "Confirmed" | "Pending" | "Withdrawn";
export type VolunteerStatus = "Active" | "Pending" | "Inactive";
export type SponsorTier = "Platinum" | "Gold" | "Silver" | "Bronze";
export type SponsorStatus = "Active" | "Pending";
export type AttendeeStatus = "Checked-in" | "Registered" | "Cancelled";
export type EventStatus = "draft" | "published" | "completed";
export type SessionStatus = "draft" | "confirmed" | "live" | "completed";
export type HealthStatus = "Operational" | "Degraded" | "Down";
export type Trend = "up" | "down" | "neutral";

export interface MetricValues {
  incidentsTotal: number;
  incidentsOpen: number;
  incidentsActive: number;
  incidentsResolved: number;
  incidentsAcknowledged: number;
  incidentResolutionRate: number;
  tasksTotal: number;
  tasksOpen: number;
  tasksInProgress: number;
  tasksCompleted: number;
  taskCompletionRate: number;
  avgTaskCompletionMins: number;
  volunteersTotal: number;
  volunteersActive: number;
  volunteersOnShift: number;
  organizersTotal: number;
  shiftsTotal: number;
  shiftsActive: number;
  hermesIncidents: number;
  hermesActions: number;
  actionsLastHour: number;
  operationalReadiness: number;
}

export interface MetricSnapshot {
  _id: string;
  eventId: string;
  capturedAt: string;
  source: "auto" | "event" | "manual";
  trigger: string;
  metrics: MetricValues;
}

// ─── Operational Health ────────────────────────────────────────────────────
// Real-time, at-a-glance state of an active event. Composed from live
// incident/task/volunteer/shift records by lib/services/health-service.ts.

export type HealthGrade = "A" | "B" | "C" | "D" | "F";
export type EventHealthStatus = "Healthy" | "Stable" | "Strained" | "At Risk" | "Critical";
export type RiskSeverity = "critical" | "high" | "medium" | "low";

/** One contributor to the overall score, so the UI can show what's dragging health. */
export interface HealthComponent {
  key: "tasks" | "incidents" | "staffing" | "response";
  label: string;
  score: number; // 0-100
  detail: string;
}

export interface HealthIncident {
  _id: string;
  slug?: string;
  title: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  source: string;
  ageMins: number;
  acknowledged: boolean;
  staleMins: number; // minutes since last update
}

export interface HealthTaskProgress {
  total: number;
  completed: number;
  inProgress: number;
  open: number;
  blocked: number;
  escalated: number;
  overdue: number;
  unassigned: number;
  completionRate: number;
  atRisk: number; // overdue + blocked + escalated (deduped)
}

export interface HealthVolunteerLoad {
  name: string;
  role: string;
  activeTasks: number;
  overdue: number;
  blocked: number;
  onShift: boolean;
  overloaded: boolean;
}

export interface HealthWorkforce {
  total: number;
  active: number;
  onShiftNow: number;
  withActiveWork: number;
  unassignedActiveTasks: number;
  load: HealthVolunteerLoad[];
}

export interface HealthResponse {
  incidentResolutionRate: number;
  mttrMins: number;
  avgAckMins: number;
  acknowledgedRate: number;
  taskCompletionRate: number;
  avgTaskCompletionMins: number;
  actionsLastHour: number;
}

export interface HealthAttentionItem {
  id: string;
  severity: RiskSeverity;
  category: "incident" | "task" | "staffing";
  title: string;
  detail: string;
  link?: string;
}

export interface EventHealth {
  hasData: boolean;
  eventName: string | null;
  score: number; // 0-100
  grade: HealthGrade;
  status: EventHealthStatus;
  components: HealthComponent[];
  incidents: {
    total: number;
    active: number;
    resolved: number;
    unacknowledgedUrgent: number; // active high/critical with no acknowledgement
    critical: number; // active critical
    list: HealthIncident[];
  };
  tasks: HealthTaskProgress;
  workforce: HealthWorkforce;
  response: HealthResponse;
  attention: HealthAttentionItem[];
  attentionTotal: number;
  generatedAt: string;
}

export interface Speaker {
  _id: string;
  eventId: string;
  fullName: string;
  email: string;
  company: string;
  title: string;
  bio: string;
  topic: string;
  status: SpeakerStatus;
}

export interface Volunteer {
  _id: string;
  eventId: string;
  fullName: string;
  email: string;
  role: string;
  shift: string;
  status: VolunteerStatus;
}

export interface Sponsor {
  _id: string;
  eventId: string;
  companyName: string;
  tier: SponsorTier;
  contact: string;
  status: SponsorStatus;
}

export type ShiftStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export interface Shift {
  _id: string;
  eventId: string;
  title: string;
  description: string;
  location: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedTo: string;
  status: ShiftStatus;
}

export interface Attendee {
  _id: string;
  eventId: string;
  fullName: string;
  email: string;
  organization: string;
  ticketType: string;
  status: AttendeeStatus;
}

export interface Organizer {
  _id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
}

export interface Facility {
  _id: string;
  eventId: string;
  name: string;
  type: string;
  address: string;
  capacity: number;
  contactName: string;
  contactEmail: string;
}

export interface Event {
  _id: string;
  name: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
}

export interface Session {
  _id: string;
  title: string;
  abstract: string;
  eventId: string | Event;
  speakerIds: (string | Speaker)[];
  roomId: string | Room;
  startTime: string;
  endTime: string;
  track: string;
  status: SessionStatus;
}

export interface Room {
  _id: string;
  eventId: string;
  name: string;
  capacity: number;
  location: string;
  setupStyle: string;
  avNotes: string;
}

export interface APILog {
  _id: string;
  method: string;
  path: string;
  status: number;
  duration: string;
  timestamp: string;
}

export interface SystemHealth {
  _id: string;
  service: string;
  status: HealthStatus;
  uptime: string;
  lastChecked: string;
}

export interface AnalyticsMetric {
  _id: string;
  name: string;
  value: string;
  change: string;
  trend: Trend;
}

export interface Incident {
  _id: string;
  eventId?: string | Event;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  status: "open" | "investigating" | "mitigated" | "resolved" | "closed";
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
  // Hermes enrichment (present when source === "hermes")
  title?: string;
  slug?: string;
  source?: "manual" | "hermes";
  analysis?: HermesIncident;
  // Field staff acknowledgements (situational awareness).
  acknowledgedBy?: IncidentAcknowledgement[];
}

export interface IncidentAcknowledgement {
  name: string;
  role: string;
  at: string;
}

export interface IncidentMessage {
  _id: string;
  incidentId: string;
  sender: { id: string; name: string; role: string };
  content: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  incidentId?: string | Incident;
  eventId: string | Event;
  title: string;
  description: string;
  status: "open" | "in-progress" | "completed" | "blocked" | "cancelled" | "escalated";
  assignedTo: string;
  assignedBy: string;
  assignmentReason?: string;
  priority: "low" | "medium" | "high";
  dueAt?: string;
  blockedReason?: string;
  escalationLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "task_assigned"
  | "task_updated"
  | "task_escalated"
  | "task_completed"
  | "task_blocked"
  | "task_recovered"
  | "incident_assigned"
  | "system_alert"
  | "general";

export interface Notification {
  _id: string;
  recipient: string; // Full name or ID
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  sourceId?: string; // ID of the related task, incident, etc.
  createdAt: string;
  updatedAt: string;
}

export interface TaskMessage {
  _id: string;
  taskId: string;
  sender: {
    id: string;
    name: string;
    role: "volunteer" | "lead" | "commander" | string;
  };
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  mentions?: string[];
  readBy?: {
    userId: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
