import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { logActivity } from "@/lib/activity-logger";
import { validateEvent, assertEventDeletable } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = await request.json();

    const existing = await Event.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }
    await validateEvent(payload, { id, existing: existing.toObject() });

    const event = await Event.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });

    await logActivity({
      user: "Admin",
      type: "human",
      action: "update",
      target: "event",
      details: `Updated event: ${event.name}`,
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Block deletion while dependent records still point at this event.
    await assertEventDeletable(id);

    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "delete",
      target: "event",
      details: `Deleted event: ${event.name}`,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
