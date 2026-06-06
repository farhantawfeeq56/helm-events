export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface ChecklistItem {
  text: string;
  status: "pending" | "in-progress" | "completed";
}

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

export type HermesResponse = 
  | { type: "text"; content: string }
  | { type: "operational-card"; content: string; incidentData: Incident }
  | { type: "execution-checklist"; content: string; checklist: ChecklistItem[] };

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
          { text: "Notify session moderators", status: "pending" }
        ]
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
          { text: "Monitor crowd density in coffee areas", status: "pending" }
        ]
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
          { text: "Schedule push notification in CMS", status: "in-progress" }
        ]
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
    id: "sponsor-request",
    title: "Sponsor Request",
    severity: "Medium",
    status: "Open",
    timestamp: "25m ago",
    description: "Lead sponsor 'TechCorp' requested additional power outlets for their booth in the Expo Hall.",
    impactAnalysis: ["Expo Hall Infrastructure", "Sponsor Satisfaction"],
    responseOptions: [
      {
        id: 4,
        title: "Deploy electrical team to Booth 42",
        summary: "Send the onsite electrical team to TechCorp's booth to install additional power strips and verify load requirements.",
        pros: ["Directly addresses sponsor needs", "Maintains positive relationship with key sponsor"],
        cons: ["May temporarily block aisle during installation"],
        operationalConsiderations: "Ensure the team works quickly to avoid disruption during peak hall hours.",
        status: "pending",
        priority: "medium",
        steps: [
          { text: "Locate available electrical team members", status: "completed" },
          { text: "Dispatch team to Booth 42", status: "in-progress" },
          { text: "Verify completion and sponsor satisfaction", status: "pending" }
        ]
      },
      {
        id: 5,
        title: "Verify load capacity with venue",
        summary: "Confirm with venue engineering that the additional power request won't trip breakers in the Expo Hall B sector.",
        pros: ["Prevents widespread power outages", "Ensures compliance with fire safety regulations"],
        cons: ["Adds a small delay to the response"],
        operationalConsiderations: "Have the venue engineer on standby while the electrical team performs the installation.",
        status: "pending",
        priority: "high",
        steps: [
          { text: "Contact venue engineering desk", status: "completed" },
          { text: "Review circuit load for Hall B Sector 4", status: "in-progress" },
          { text: "Approve additional draw", status: "pending" }
        ]
      },
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
      {
        id: 6,
        title: "Reassign volunteers from Session Support",
        summary: "Move two volunteers from the relatively quiet breakout session track to the registration desk.",
        pros: ["Immediate fix for registration bottlenecks", "Utilizes existing onsite staff"],
        cons: ["Reduces support availability for breakout speakers"],
        operationalConsiderations: "Brief the reassigned volunteers on registration procedures before they start.",
        status: "pending",
        priority: "medium",
        steps: [
          { text: "Identify underutilized volunteers in Track 3", status: "completed" },
          { text: "Reassign 2 volunteers to Registration", status: "in-progress" },
          { text: "Provide quick briefing on reg software", status: "pending" }
        ]
      },
      {
        id: 7,
        title: "Call backup volunteer list",
        summary: "Contact the standby volunteer pool to fill the missing slots for the remainder of the day.",
        pros: ["Restores full staffing levels", "Doesn't compromise other event areas"],
        cons: ["Takes 30-60 minutes for backup staff to arrive"],
        operationalConsiderations: "Offer additional meal vouchers as an incentive for last-minute callers.",
        status: "pending",
        priority: "medium",
        steps: [
          { text: "Access standby volunteer contact list", status: "completed" },
          { text: "Send automated SMS blast to standby pool", status: "in-progress" },
          { text: "Confirm 3 replacements", status: "pending" }
        ]
      },
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
          { text: "Verify connectivity at each station", status: "pending" }
        ]
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
          { text: "Receive ETR and report back", status: "pending" }
        ]
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
          { text: "Update digital signage in Hall B", status: "pending" }
        ]
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
  {
    id: "room-conflict",
    title: "Room Conflict",
    severity: "High",
    status: "Investigating",
    timestamp: "2m ago",
    description: "Hall B is double-booked for the 'AI Ethics' workshop and the 'Cloud Computing' seminar at 2:00 PM.",
    impactAnalysis: ["Hall B Schedule", "Attendee Satisfaction", "Speaker Logistics"],
    responseOptions: [
      {
        id: 11,
        title: "Move 'Cloud Computing' to Room 101",
        summary: "Relocate the Cloud Computing seminar to the smaller but available Room 101.",
        pros: ["Resolves the booking conflict", "Both sessions can proceed at scheduled times"],
        cons: ["Room 101 has 30% less capacity", "Requires attendees to walk to another wing"],
        operationalConsiderations: "Station a staff member at Hall B to redirect attendees to Room 101.",
        status: "pending",
        priority: "high",
        steps: [
          { text: "Confirm Room 101 is vacant and setup", status: "completed" },
          { text: "Station redirect staff at Hall B", status: "in-progress" },
          { text: "Coordinate speaker relocation", status: "pending" }
        ]
      },
      {
        id: 12,
        title: "Notify speakers of both sessions",
        summary: "Immediately inform both speakers of the conflict and the proposed resolution to ensure their cooperation.",
        pros: ["Maintains speaker confidence", "Ensures technical needs are met in new room"],
        cons: ["May cause stress for the relocating speaker"],
        operationalConsiderations: "Offer technical assistant to help the Cloud Computing speaker move their materials.",
        status: "pending",
        priority: "high",
        steps: [
          { text: "Locate 'AI Ethics' speaker", status: "completed" },
          { text: "Locate 'Cloud Computing' speaker", status: "completed" },
          { text: "Brief both speakers on resolution", status: "in-progress" }
        ]
      },
      {
        id: 13,
        title: "Update signage at Hall B",
        summary: "Update the digital and physical signage outside Hall B to reflect the new room assignment for Cloud Computing.",
        pros: ["Reduces attendee confusion", "Provides clear wayfinding"],
        cons: ["Requires rapid production of physical signs if digital ones fail"],
        operationalConsiderations: "Use 'Move' directional arrows to make the new location clear.",
        status: "pending",
        priority: "medium",
        steps: [
          { text: "Update digital door sign for Hall B", status: "completed" },
          { text: "Place physical A-frame with redirection", status: "in-progress" },
          { text: "Update wayfinding kiosks", status: "pending" }
        ]
      },
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
      {
        id: 14,
        title: "Push back start time to 4:00 PM",
        summary: "Formally delay the panel start time to allow for complex technical stage setup.",
        pros: ["Ensures technical setup is perfect", "Avoids awkward mid-session technical failures"],
        cons: ["Shortens the Q&A portion if the room is needed later"],
        operationalConsiderations: "Check if the following session in the same room can also be shifted if needed.",
        status: "pending",
        priority: "low",
        steps: [
          { text: "Verify technical setup requirements", status: "completed" },
          { text: "Consult with panel speakers on shift", status: "in-progress" },
          { text: "Finalize new start time", status: "pending" }
        ]
      },
      {
        id: 15,
        title: "Update mobile app and website",
        summary: "Sync the new 4:00 PM start time to the attendee-facing app and the public schedule website.",
        pros: ["Provides 'single source of truth' for schedule", "Reduces manual inquiries at info desks"],
        cons: ["None"],
        operationalConsiderations: "Verify that the sync completes across all caching layers of the website.",
        status: "pending",
        priority: "low",
        steps: [
          { text: "Update schedule in master CMS", status: "completed" },
          { text: "Trigger mobile app cache refresh", status: "in-progress" },
          { text: "Verify website update", status: "pending" }
        ]
      },
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
