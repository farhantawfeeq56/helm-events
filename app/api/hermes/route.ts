import { NextRequest, NextResponse } from "next/server";
import { HermesResponse, mockIncidents } from "@/lib/hermes";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const lowerText = message.toLowerCase();

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

    const response: HermesResponse = {
      content: incidentData
        ? `I've analyzed the ${incidentData.title} incident. Here is the operational assessment and recommended actions:`
        : "I've reviewed the situation. How would you like me to proceed with this request?",
      type: incidentData ? "operational-card" : "text",
      incidentData: incidentData || undefined,
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in Hermes API:", error);
    return NextResponse.json(
      { content: "Sorry, I encountered an error processing your request.", type: "text" },
      { status: 500 }
    );
  }
}
