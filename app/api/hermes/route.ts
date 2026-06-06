import { NextRequest, NextResponse } from "next/server";
import { processHermesMessage } from "@/lib/hermes-handler";

/**
 * Hermes API Bridge
 * 
 * This route serves as a lightweight wrapper around the shared handler,
 * which can also be deployed as a GCP Cloud Function.
 */
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { content: "No message provided.", type: "text" },
        { status: 400 }
      );
    }

    const response = await processHermesMessage(message);

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
