import { Clock, Handshake, UserPlus, WifiHigh, Warning, CalendarPlus } from "@phosphor-icons/react";

export const operationalActions = [
  {
    label: "Speaker Delayed",
    message: "I need to report a speaker delay for the keynote. What's the protocol?",
    icon: Clock,
  },
  {
    label: "Internet Outage",
    message: "Wi-Fi is down in Hall B and affecting the workshops. Analyze the situation.",
    icon: WifiHigh,
  },
  {
    label: "Sponsor Request",
    message: "TechCorp sponsor needs more power outlets at Booth 42. How should we handle this?",
    icon: Handshake,
  },
  {
    label: "Volunteer Gap",
    message: "We're short-staffed at registration as some volunteers didn't show up. What's the backup plan?",
    icon: UserPlus,
  },
  {
    label: "Room Conflict",
    message: "There's a room conflict in Hall B between 2 PM and 3 PM. Help me resolve it.",
    icon: Warning,
  },
  {
    label: "Schedule Update",
    message: "Update the schedule for the 'Future of AI' panel to start at 4 PM instead of 3:30 PM.",
    icon: CalendarPlus,
  },
];

export const volunteerActions = [
  {
    label: "Issue Reporting",
    message: "I need to report an issue with the Wi-Fi in Hall B.",
    icon: WifiHigh,
  },
  {
    label: "Info Lookup",
    message: "Where is the nearest medical station?",
    icon: Warning,
  },
  {
    label: "Task Escalation",
    message: "I need to escalate a task to the operations team.",
    icon: UserPlus,
  },
  {
    label: "Task Summary",
    message: "Summarize my active tasks for this shift.",
    icon: Clock,
  },
];

export const IconMap: Record<string, any> = {
  Clock,
  Handshake,
  UserPlus,
  WifiHigh,
  Warning,
  CalendarPlus,
};
