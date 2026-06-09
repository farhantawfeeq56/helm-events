import { HermesResponse, mockIncidents } from "./hermes";
import { logActivity } from "./activity-logger";

/**
 * Core logic for processing Hermes messages.
 * This is decoupled from Next.js to be portable for GCP Cloud Functions.
 */
export async function processHermesMessage(message: string): Promise<HermesResponse> {
  const lowerText = message.toLowerCase();

  // Log that Hermes is processing a request
  await logActivity({
    user: "Hermes",
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

    return {
      type: "operational-card",
      content: `ANALYSIS COMPLETE: ${incidentData.title.toUpperCase()}. RESPONSE OPTIONS GENERATED.`,
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
