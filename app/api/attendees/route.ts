import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Attendee } from "@/models/attendee";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const query = eventId ? { eventId } : {};

    const attendees = await Attendee.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: attendees });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const attendee = await Attendee.create(payload);
    return NextResponse.json({ success: true, data: attendee }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create attendee.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
