import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const event = await Event.create(payload);

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create event.";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
