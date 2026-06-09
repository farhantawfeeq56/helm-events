export type SpeakerStatus = "Confirmed" | "Pending" | "Withdrawn";
export type VolunteerStatus = "Active" | "Pending" | "Inactive";
export type SponsorTier = "Platinum" | "Gold" | "Silver" | "Bronze";
export type SponsorStatus = "Active" | "Pending";
export type AttendeeStatus = "Checked-in" | "Registered" | "Cancelled";
export type EventStatus = "draft" | "published" | "completed";
export type SessionStatus = "draft" | "confirmed" | "live" | "completed";
export type HealthStatus = "Operational" | "Degraded" | "Down";
export type Trend = "up" | "down" | "neutral";

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
  eventId: string | Event;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  status: "open" | "investigating" | "mitigated" | "resolved" | "closed";
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  incidentId?: string | Incident;
  eventId: string | Event;
  title: string;
  description: string;
  status: "open" | "in-progress" | "completed" | "blocked";
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}
