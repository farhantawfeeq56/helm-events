// TODO: Replace with MongoDB-backed volunteer assignments once identity and assignment infrastructure is completed.

export interface MockShift {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  status: "upcoming" | "in-progress" | "completed";
}

export interface MockTask {
  id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  location: string;
  assignedBy: string;
}

export interface MockIncident {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "mitigated" | "resolved" | "closed";
  location: string;
  reportedAt: string;
}

// TODO: Replace with MongoDB-backed volunteer shifts once identity and assignment infrastructure is completed.
export const mockShifts: MockShift[] = [
  {
    id: "shift-001",
    title: "Registration Desk Support",
    description: "Assist attendees with check-in, badge distribution, and general inquiries at the main registration area.",
    location: "Main Lobby - Registration Desk",
    startTime: "08:00",
    endTime: "10:00",
    status: "completed",
  },
  {
    id: "shift-002",
    title: "Workshop Hall Support",
    description: "Help direct attendees to workshop rooms, manage seating, and assist speakers with setup.",
    location: "Workshop Hall A & B",
    startTime: "10:00",
    endTime: "13:00",
    status: "in-progress",
  },
  {
    id: "shift-003",
    title: "Lunch Coordination",
    description: "Monitor the catering area, restock supplies, and assist with crowd flow during lunch break.",
    location: "Dining Pavilion",
    startTime: "13:00",
    endTime: "14:00",
    status: "upcoming",
  },
  {
    id: "shift-004",
    title: "Main Stage Support",
    description: "Support backstage operations, assist speakers with mic checks, and manage stage transitions.",
    location: "Main Auditorium",
    startTime: "14:00",
    endTime: "17:00",
    status: "upcoming",
  },
];

// TODO: Replace with MongoDB-backed volunteer tasks once identity and assignment infrastructure is completed.
export const mockTasks: MockTask[] = [
  {
    id: "task-001",
    title: "Verify Speaker Check-in",
    description: "Cross-reference the speaker manifest with the check-in list and report any no-shows to the stage manager.",
    status: "open",
    priority: "high",
    location: "Speaker Green Room",
    assignedBy: "Operations Control",
  },
  {
    id: "task-002",
    title: "Distribute Workshop Materials",
    description: "Deliver printed handouts, name tents, and feedback forms to each workshop room before the first session.",
    status: "in-progress",
    priority: "medium",
    location: "Workshop Hall A & B",
    assignedBy: "Workshop Coordinator",
  },
  {
    id: "task-003",
    title: "Prepare Sponsor Booth Signage",
    description: "Place directional signage and sponsor banners in the exhibition area ahead of the trade show opening.",
    status: "open",
    priority: "medium",
    location: "Exhibition Hall",
    assignedBy: "Sponsorship Lead",
  },
  {
    id: "task-004",
    title: "Confirm Volunteer Attendance",
    description: "Call or message all volunteers assigned to the afternoon shift to confirm their availability.",
    status: "completed",
    priority: "low",
    location: "Operations Office",
    assignedBy: "Volunteer Lead",
  },
  {
    id: "task-005",
    title: "Collect Feedback Forms",
    description: "Gather completed feedback forms from all session rooms and deliver them to the operations desk.",
    status: "open",
    priority: "low",
    location: "All Session Rooms",
    assignedBy: "Operations Control",
  },
];

// TODO: Replace with MongoDB-backed volunteer incidents once identity and assignment infrastructure is completed.
export const mockIncidents: MockIncident[] = [
  {
    id: "incident-001",
    title: "Projector Failure in Hall B",
    description: "The main projector in Workshop Hall B is displaying a flickering image. Backup unit is being prepared.",
    severity: "high",
    status: "investigating",
    location: "Workshop Hall B",
    reportedAt: "2025-04-10T09:15:00Z",
  },
  {
    id: "incident-002",
    title: "Speaker Delayed by 20 Minutes",
    description: "Keynote speaker is stuck in traffic and will arrive 20 minutes late. Schedule adjustment needed.",
    severity: "medium",
    status: "mitigated",
    location: "Main Auditorium",
    reportedAt: "2025-04-10T08:45:00Z",
  },
  {
    id: "incident-003",
    title: "Registration Queue Overcrowding",
    description: "Long queues forming at the registration desk due to a barcode scanner malfunction. Manual check-in is underway.",
    severity: "high",
    status: "open",
    location: "Main Lobby - Registration Desk",
    reportedAt: "2025-04-10T08:00:00Z",
  },
  {
    id: "incident-004",
    title: "Workshop Room Temperature Issue",
    description: "Workshop Room C is too warm due to HVAC malfunction. Portable fans have been requested.",
    severity: "low",
    status: "resolved",
    location: "Workshop Room C",
    reportedAt: "2025-04-10T07:30:00Z",
  },
];