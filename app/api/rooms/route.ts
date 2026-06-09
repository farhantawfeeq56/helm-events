import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Room } from "@/models/room";
import { logActivity } from "@/lib/activity-logger";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const query = eventId ? { eventId } : {};

    const rooms = await Room.find(query).sort({ name: 1 });
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const room = await Room.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "room",
      details: `Created room: ${room.name}`,
    });

    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create room.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
