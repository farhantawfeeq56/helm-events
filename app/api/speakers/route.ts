import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Speaker } from "@/models/speaker";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(Speaker, request, {}, ["fullName", "email", "company", "topic"]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch speakers.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const speaker = await Speaker.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "speaker",
      details: `Created speaker: ${speaker.fullName}`,
    });

    return NextResponse.json({ success: true, data: speaker }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create speaker.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
