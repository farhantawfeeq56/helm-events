import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(Event, request, {}, ["name", "venue", "city"]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch events.";

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
    const event = await Event.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "event",
      details: `Created event: ${event.name}`,
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create event.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}