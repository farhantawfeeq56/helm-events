export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface RecommendedAction {
  id: number;
  action: string;
  status: "pending" | "approved" | "declined";
}

export interface RiskAssessment {
  level: string;
  explanation: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  timestamp: string;
  description: string;
  impact: string[];
  recommendedActions: RecommendedAction[];
  riskAssessment: RiskAssessment;
  executionStatus: string;
  iconName: string;
  color: string;
}

export interface HermesRequest {
  message: string;
  context?: any;
}

export interface HermesResponse {
  content: string;
  type: "text" | "operational-card";
  incidentData?: Incident;
}

export const mockIncidents: Incident[] = [
  {
    id: "speaker-delay",
    title: "Speaker Delay",
    severity: "High",
    status: "Investigating",
    timestamp: "10m ago",
    description: "Keynote speaker Dr. Sarah Chen is stuck in traffic and will be 20 minutes late for her 10:00 AM session.",
    impact: ["Main Stage Schedule", "Attendee Flow", "Live Stream Timing"],
    recommendedActions: [
      { id: 1, action: "Push back keynote by 20 minutes", status: "pending" },
      { id: 2, action: "Extend morning networking break", status: "pending" },
      { id: 3, action: "Notify attendees via mobile app", status: "pending" },
    ],
    riskAssessment: {
      level: "Medium",
      explanation: "Delay might cascade into afternoon sessions if not managed properly.",
    },
    executionStatus: "Awaiting approval for schedule adjustment.",
    iconName: "Clock",
    color: "amber",
  },
  {
    id: "sponsor-request",
    title: "Sponsor Request",
    severity: "Medium",
    status: "Open",
    timestamp: "25m ago",
    description: "Lead sponsor 'TechCorp' requested additional power outlets for their booth in the Expo Hall.",
    impact: ["Expo Hall Infrastructure", "Sponsor Satisfaction"],
    recommendedActions: [
      { id: 4, action: "Deploy electrical team to Booth 42", status: "pending" },
      { id: 5, action: "Verify load capacity with venue", status: "pending" },
    ],
    riskAssessment: {
      level: "Low",
      explanation: "Standard operational request, minimal risk to overall event.",
    },
    executionStatus: "Electrical team notified.",
    iconName: "Handshake",
    color: "blue",
  },
  {
    id: "volunteer-absence",
    title: "Volunteer Absence",
    severity: "Medium",
    status: "In Progress",
    timestamp: "45m ago",
    description: "Three volunteers for the registration desk failed to show up for their shift.",
    impact: ["Registration Wait Times", "Entrance Logistics"],
    recommendedActions: [
      { id: 6, action: "Reassign volunteers from Session Support", status: "pending" },
      { id: 7, action: "Call backup volunteer list", status: "pending" },
    ],
    riskAssessment: {
      level: "Low",
      explanation: "Can be managed by reallocating existing staff momentarily.",
    },
    executionStatus: "Contacting backup volunteers.",
    iconName: "UserPlus",
    color: "orange",
  },
  {
    id: "internet-outage",
    title: "Internet Outage",
    severity: "Critical",
    status: "Investigating",
    timestamp: "5m ago",
    description: "Wi-Fi connectivity lost in Hall B, affecting several workshops and live demos.",
    impact: ["Workshop Connectivity", "Demo Performance", "Attendee Experience"],
    recommendedActions: [
      { id: 8, action: "Switch to backup cellular hotspots", status: "pending" },
      { id: 9, action: "Contact venue IT department", status: "pending" },
      { id: 10, action: "Post status update on event portal", status: "pending" },
    ],
    riskAssessment: {
      level: "High",
      explanation: "Multiple sessions rely on internet; downtime significantly impacts session quality.",
    },
    executionStatus: "Venue IT investigating fiber line.",
    iconName: "WifiHigh",
    color: "red",
  },
  {
    id: "room-conflict",
    title: "Room Conflict",
    severity: "High",
    status: "Investigating",
    timestamp: "2m ago",
    description: "Hall B is double-booked for the 'AI Ethics' workshop and the 'Cloud Computing' seminar at 2:00 PM.",
    impact: ["Hall B Schedule", "Attendee Satisfaction", "Speaker Logistics"],
    recommendedActions: [
      { id: 11, action: "Move 'Cloud Computing' to Room 101", status: "pending" },
      { id: 12, action: "Notify speakers of both sessions", status: "pending" },
      { id: 13, action: "Update signage at Hall B", status: "pending" },
    ],
    riskAssessment: {
      level: "Medium",
      explanation: "Capacity of Room 101 is smaller than Hall B.",
    },
    executionStatus: "Checking Room 101 availability.",
    iconName: "Warning",
    color: "amber",
  },
  {
    id: "schedule-update",
    title: "Schedule Update",
    severity: "Low",
    status: "Open",
    timestamp: "Just now",
    description: "The 'Future of AI' panel needs to be shifted from 3:30 PM to 4:00 PM due to a technical setup requirement.",
    impact: ["Session Timing", "Room Availability"],
    recommendedActions: [
      { id: 14, action: "Push back start time to 4:00 PM", status: "pending" },
      { id: 15, action: "Update mobile app and website", status: "pending" },
    ],
    riskAssessment: {
      level: "Low",
      explanation: "Minimal impact on the overall program.",
    },
    executionStatus: "Awaiting approval for schedule change.",
    iconName: "CalendarPlus",
    color: "blue",
  },
];
