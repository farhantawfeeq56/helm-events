import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";
import { validateEvent } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

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
    await validateEvent(payload);
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
    return errorResponse(error);
  }
}