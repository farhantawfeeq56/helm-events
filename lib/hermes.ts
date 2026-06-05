export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface RecommendedAction {
  id: number;
  action: string;
  status: "pending" | "approved" | "declined";
  priority: "high" | "medium" | "low";
}

export interface RiskAssessment {
  level: "Critical" | "High" | "Medium" | "Low";
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

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  timestamp: string;
  description: string;
  impactAnalysis: string[];
  responseOptions: RecommendedAction[];
  riskAssessment: RiskAssessment;
  communications: CommunicationPlan[];
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
    impactAnalysis: ["Main Stage Schedule", "Attendee Flow", "Live Stream Timing"],
    responseOptions: [
      { id: 1, action: "Push back keynote by 20 minutes", status: "pending", priority: "high" },
      { id: 2, action: "Extend morning networking break", status: "pending", priority: "medium" },
      { id: 3, action: "Notify attendees via mobile app", status: "pending", priority: "high" },
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
    id: "sponsor-request",
    title: "Sponsor Request",
    severity: "Medium",
    status: "Open",
    timestamp: "25m ago",
    description: "Lead sponsor 'TechCorp' requested additional power outlets for their booth in the Expo Hall.",
    impactAnalysis: ["Expo Hall Infrastructure", "Sponsor Satisfaction"],
    responseOptions: [
      { id: 4, action: "Deploy electrical team to Booth 42", status: "pending", priority: "medium" },
      { id: 5, action: "Verify load capacity with venue", status: "pending", priority: "high" },
    ],
    riskAssessment: {
      level: "Low",
      explanation: "Standard operational request, minimal risk to overall event.",
      mitigationStrategy: "Ensure all electrical work is signed off by venue safety officer.",
    },
    communications: [
      { id: 3, channel: "Email", audience: "TechCorp Point of Contact", message: "We've received your request for additional power. A technician is on their way.", status: "draft" },
    ],
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
    impactAnalysis: ["Registration Wait Times", "Entrance Logistics"],
    responseOptions: [
      { id: 6, action: "Reassign volunteers from Session Support", status: "pending", priority: "medium" },
      { id: 7, action: "Call backup volunteer list", status: "pending", priority: "medium" },
    ],
    riskAssessment: {
      level: "Low",
      explanation: "Can be managed by reallocating existing staff momentarily.",
      mitigationStrategy: "Activate secondary volunteer pool and offer overtime incentives if needed.",
    },
    communications: [
      { id: 4, channel: "SMS", audience: "Backup Volunteer Pool", message: "Urgent: Additional help needed at Registration. 2hr shifts available now.", status: "draft" },
    ],
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
    impactAnalysis: ["Workshop Connectivity", "Demo Performance", "Attendee Experience"],
    responseOptions: [
      { id: 8, action: "Switch to backup cellular hotspots", status: "pending", priority: "high" },
      { id: 9, action: "Contact venue IT department", status: "pending", priority: "high" },
      { id: 10, action: "Post status update on event portal", status: "pending", priority: "medium" },
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
  {
    id: "room-conflict",
    title: "Room Conflict",
    severity: "High",
    status: "Investigating",
    timestamp: "2m ago",
    description: "Hall B is double-booked for the 'AI Ethics' workshop and the 'Cloud Computing' seminar at 2:00 PM.",
    impactAnalysis: ["Hall B Schedule", "Attendee Satisfaction", "Speaker Logistics"],
    responseOptions: [
      { id: 11, action: "Move 'Cloud Computing' to Room 101", status: "pending", priority: "high" },
      { id: 12, action: "Notify speakers of both sessions", status: "pending", priority: "high" },
      { id: 13, action: "Update signage at Hall B", status: "pending", priority: "medium" },
    ],
    riskAssessment: {
      level: "Medium",
      explanation: "Capacity of Room 101 is smaller than Hall B.",
      mitigationStrategy: "Monitor Room 101 occupancy and redirect overflow to a live stream viewing area.",
    },
    communications: [
      { id: 7, channel: "Push", audience: "Cloud Computing Attendees", message: "Venue change: 'Cloud Computing' seminar has moved to Room 101.", status: "draft" },
    ],
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
    impactAnalysis: ["Session Timing", "Room Availability"],
    responseOptions: [
      { id: 14, action: "Push back start time to 4:00 PM", status: "pending", priority: "low" },
      { id: 15, action: "Update mobile app and website", status: "pending", priority: "low" },
    ],
    riskAssessment: {
      level: "Low",
      explanation: "Minimal impact on the overall program.",
      mitigationStrategy: "None required.",
    },
    communications: [
      { id: 8, channel: "Push", audience: "All Attendees", message: "Schedule Update: 'Future of AI' panel will now begin at 4:00 PM.", status: "draft" },
    ],
    executionStatus: "Awaiting approval for schedule change.",
    iconName: "CalendarPlus",
    color: "blue",
  },
];
