import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Organizer } from "@/models/organizer";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const query = eventId ? { eventId } : {};

    const organizers = await Organizer.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: organizers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch organizers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const organizer = await Organizer.create(payload);

    return NextResponse.json({ success: true, data: organizer }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create organizer.";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
