import { NextRequest, NextResponse } from "next/server";
import { HermesResponse, mockIncidents } from "@/lib/hermes";

/**
 * Hermes API Bridge
 * 
 * This route serves as the bridge between the frontend and the 
 * Google Cloud Platform (GCP) services, specifically Vertex AI 
 * and Cloud Functions.
 */
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const lowerText = message.toLowerCase();

    // In a production environment, this would call Vertex AI (Gemini 1.5 Pro)
    // to analyze the input and return a structured response.
    // For this refactor, we simulate that behavior by returning our 
    // new serializable data model.

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

    // Simulate calling a Cloud Function for pattern matching or real-time data
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response: HermesResponse = {
      content: incidentData
        ? `ANALYSIS COMPLETE: ${incidentData.title.toUpperCase()}. RESPONSE OPTIONS GENERATED.`
        : "NO MATCHING INCIDENT FOUND. AWAITING COMMAND.",
      type: incidentData ? "operational-card" : "text",
      incidentData: incidentData || undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in Hermes API Bridge:", error);
    return NextResponse.json(
      { 
        content: "SYSTEM ERROR: CONNECTION FAILED. RETRY INITIATED.", 
        type: "text" 
      },
      { status: 500 }
    );
  }
}
