import { HermesResponse, mockIncidents } from "./hermes";
import { logActivity } from "./activity-logger";

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
  
  let incidentData = null;

  if (lowerText.includes("delay")) {
    incidentData = mockIncidents.find((i) => i.id === "speaker-delay");
  } else if (lowerText.includes("sponsor")) {
    incidentData = mockIncidents.find((i) => i.id === "sponsor-request");
  } else if (lowerText.includes("volunteer")) {
    incidentData = mockIncidents.find((i) => i.id === "volunteer-absence");
  } else if (lowerText.includes("internet") || lowerText.includes("wifi") || lowerText.includes("wi-fi")) {
    incidentData = mockIncidents.find((i) => i.id === "internet-outage");
  } else if (lowerText.includes("conflict")) {
    incidentData = mockIncidents.find((i) => i.id === "room-conflict");
  } else if (lowerText.includes("schedule")) {
    incidentData = mockIncidents.find((i) => i.id === "schedule-update");
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
    let filteredIncident = { ...incidentData };

    if (role === "volunteer") {
      responseContent = `ANALYSIS COMPLETE: ${incidentData.title.toUpperCase()}. I have retrieved the status and impact details for you.`;
      // Sanitize data for volunteers
      const { 
        responseOptions, 
        riskAssessment, 
        communications, 
        ...sanitizedIncident 
      } = filteredIncident as any;
      filteredIncident = sanitizedIncident;
    }

    return {
      type: "operational-card",
      content: responseContent,
      incidentData: filteredIncident as any,
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
