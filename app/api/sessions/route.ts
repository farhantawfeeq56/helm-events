import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Session } from "@/models/session";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";
import "@/models/event";
import "@/models/speaker";
import "@/models/room";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(
      Session,
      request,
      {},
      ["title", "track", "abstract"],
      ["eventId", "speakerIds", "roomId"],
      { startTime: 1 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const session = await Session.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "session",
      details: `Created session: ${session.title}`,
    });

    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create session.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
