import { HermesResponse, mockIncidents, ReportedIssue, Severity, Incident } from "./hermes";
import { logActivity } from "./activity-logger";

// Intelligence Utilities for Signal Extraction
function extractSignals(message: string): string[] {
  const signals = [];
  const lower = message.toLowerCase();
  
  if (lower.includes("leak") || lower.includes("water") || lower.includes("fluid")) signals.push("Fluid Leak");
  if (lower.includes("fire") || lower.includes("smoke") || lower.includes("burning")) signals.push("Fire Hazard");
  if (lower.includes("crowd") || lower.includes("packed") || lower.includes("density")) signals.push("Crowd Density");
  if (lower.includes("power") || lower.includes("outlet") || lower.includes("electricity")) signals.push("Power Issue");
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet")) signals.push("Connectivity");
  if (lower.includes("medical") || lower.includes("hurt") || lower.includes("sick") || lower.includes("fainted")) signals.push("Medical Emergency");
  if (lower.includes("broken") || lower.includes("damaged")) signals.push("Equipment Damage");
  
  return signals;
}

function extractLocation(message: string): string {
  const hallMatch = message.match(/Hall\s+[A-Z0-9]/i);
  const roomMatch = message.match(/Room\s+[A-Z0-9]+/i);
  const boothMatch = message.match(/Booth\s+[A-Z0-9]+/i);
  const stageMatch = message.match(/Stage\s+[A-Z0-9]+/i);
  
  if (hallMatch) return hallMatch[0];
  if (roomMatch) return roomMatch[0];
  if (boothMatch) return boothMatch[0];
  if (stageMatch) return stageMatch[0];
  
  return "Current Location/TBD";
}

function categorizeIssue(message: string): ReportedIssue["category"] {
  const lower = message.toLowerCase();
  if (lower.includes("medical") || lower.includes("hurt") || lower.includes("sick")) return "Medical";
  if (lower.includes("security") || lower.includes("fight") || lower.includes("theft") || lower.includes("suspicious")) return "Security";
  if (lower.includes("wifi") || lower.includes("wi-fi") || lower.includes("internet") || lower.includes("software")) return "Technical";
  if (lower.includes("leak") || lower.includes("light") || lower.includes("broken") || lower.includes("power")) return "Facility";
  if (lower.includes("food") || lower.includes("water") || lower.includes("shuttle") || lower.includes("signage")) return "Logistics";
  return "General";
}

function determineSeverity(message: string): Severity {
  const lower = message.toLowerCase();
  if (lower.includes("urgent") || lower.includes("emergency") || lower.includes("fire") || lower.includes("fainted") || lower.includes("critical")) return "Critical";
  if (lower.includes("broken") || lower.includes("down") || lower.includes("stopped") || lower.includes("high")) return "High";
  if (lower.includes("flickering") || lower.includes("slow") || lower.includes("medium")) return "Medium";
  return "Low";
}

function getEscalationGuidance(category: string): string {
  switch (category) {
    case "Medical":
      return "Do not move the individual. Stay with them and keep the area clear. Medical team is dispatched.";
    case "Security":
      return "Maintain a safe distance. Do not intervene. Observe and report details to security personnel via Radio channel 2.";
    case "Facility":
      return "Mark the area if hazardous (e.g., spills). Redirect attendee flow away from the issue.";
    case "Technical":
      return "Advise attendees that IT is aware and working on it. Do not attempt to reset venue hardware yourself.";
    case "Logistics":
      return "Direct attendees to the nearest alternative service point. Operations lead is coordinating a response.";
    default:
      return "Acknowledge the issue to any concerned attendees. Keep operations informed of any changes.";
  }
}

/**
 * Core logic for processing Hermes messages.
 * This is decoupled from Next.js to be portable for GCP Cloud Functions.
 */
export async function processHermesMessage(message: string, role: string = "operations"): Promise<HermesResponse> {
  const lowerText = message.toLowerCase();

  // Volunteer restricted actions
  if (role === "volunteer") {
    const blockedKeywords = ["reschedule", "reassign", "cancel", "strategy", "recovery"];
    if (blockedKeywords.some(kw => lowerText.includes(kw))) {
      return {
        type: "text",
        content: "ACCESS RESTRICTED: I am unable to perform operational changes like reassignments or schedule updates. Please contact your Operations Lead for assistance with this request.",
      };
    }
  }

  // Handle volunteer-specific informational queries
  if (role === "volunteer") {
    if (lowerText.includes("medical station")) {
      return {
        type: "text",
        content: "The nearest medical station is located at the East Entrance of Hall B, next to the Information Desk. It is staffed 24/7 during the event.",
      };
    }
    if (lowerText.includes("escalate")) {
      return {
        type: "text",
        content: "I have flagged your request for escalation. An Operations Lead has been notified and will contact you shortly via the Radio channel.",
      };
    }
    if (lowerText.includes("summarize") && lowerText.includes("task")) {
      return {
        type: "text",
        content: "You have 3 active tasks: 1. Monitor Registration Hall B, 2. Distribute lunch vouchers, 3. Assist Speaker at 2 PM. Your next shift change is at 4 PM.",
      };
    }
  }

  // Check for reporting intent
  const isReporting = lowerText.includes("report") || 
                      lowerText.includes("issue") || 
                      lowerText.includes("seeing") || 
                      lowerText.includes("problem") ||
                      lowerText.includes("found") ||
                      (lowerText.includes("there is a") && !lowerText.includes("?")) ||
                      (lowerText.includes("there's a") && !lowerText.includes("?"));

  if (isReporting && role === "volunteer") {
    const category = categorizeIssue(message);
    const severity = determineSeverity(message);
    const location = extractLocation(message);
    const signals = extractSignals(message);
    const guidance = getEscalationGuidance(category);

    const reportData: ReportedIssue = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      description: message,
      location,
      severity,
      extractedSignals: signals,
      guidance,
      status: "Reported",
      timestamp: "Just now"
    };

    await logActivity({
      user: "Hermes (Volunteer Assistant)",
      type: "agent",
      action: "Issue Categorized",
      target: reportData.id,
      details: `Structured report generated for ${category} issue at ${location}`,
    });

    return {
      type: "issue-report",
      content: "I have processed your report and extracted the key operational details. Here is the structured summary and escalation guidance:",
      reportData
    };
  }

  // Log that Hermes is processing a request
  await logActivity({
    user: role === "volunteer" ? "Hermes (Volunteer Assistant)" : "Hermes",
    type: "agent",
    action: "Processing Query",
    target: "System Intelligence",
    details: `Message: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
  });

  // Simulate AI decision logic (currently mocked)
  // In production, this would call Vertex AI with the HERMES_SYSTEM_PROMPT
  
  let incidentData: Incident | null = null;

  if (lowerText.includes("delay")) {
    incidentData = mockIncidents.find((i) => i.id === "speaker-delay") || null;
  } else if (lowerText.includes("sponsor")) {
    incidentData = mockIncidents.find((i) => i.id === "sponsor-request") || null;
  } else if (lowerText.includes("volunteer")) {
    incidentData = mockIncidents.find((i) => i.id === "volunteer-absence") || null;
  } else if (lowerText.includes("internet") || lowerText.includes("wifi") || lowerText.includes("wi-fi")) {
    incidentData = mockIncidents.find((i) => i.id === "internet-outage") || null;
  } else if (lowerText.includes("conflict")) {
    incidentData = mockIncidents.find((i) => i.id === "room-conflict") || null;
  } else if (lowerText.includes("schedule")) {
    incidentData = mockIncidents.find((i) => i.id === "schedule-update") || null;
  }

  // Simulate a bit of processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (incidentData) {
    await logActivity({
      user: "Hermes",
      type: "agent",
      action: "Incident Analysis",
      target: incidentData.title,
      details: `Generated response options for: ${incidentData.title}`,
    });

    let responseContent = `ANALYSIS COMPLETE: ${incidentData.title.toUpperCase()}. RESPONSE OPTIONS GENERATED.`;
    
    if (role === "volunteer") {
      responseContent = `ANALYSIS COMPLETE: ${incidentData.title.toUpperCase()}. I have retrieved the status and impact details for you.`;
      // Sanitize data for volunteers
      const { 
        responseOptions: _ro, 
        riskAssessment: _ra, 
        communications: _c, 
        ...sanitizedIncident 
      } = incidentData;
      
      return {
        type: "operational-card",
        content: responseContent,
        incidentData: sanitizedIncident as unknown as Incident,
      };
    }

    return {
      type: "operational-card",
      content: responseContent,
      incidentData: incidentData,
    };
  }

  // Handle a specific case for checklist to demonstrate polymorphism
  if (lowerText.includes("deploy") || lowerText.includes("execute")) {
    await logActivity({
      user: "Hermes",
      type: "agent",
      action: "Execution Commenced",
      target: "Operational Protocol",
      details: "Commencing execution checklist",
    });

    return {
      type: "execution-checklist",
      content: "EXECUTION COMMENCED. TRACKING OPERATIONAL STEPS.",
      checklist: [
        { text: "Notify relevant department", status: "completed" },
        { text: "Allocate resources", status: "in-progress" },
        { text: "Confirm resolution", status: "pending" },
      ],
    };
  }

  return {
    type: "text",
    content: "NO MATCHING INCIDENT FOUND. AWAITING COMMAND.",
  };
}
