import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Room } from "@/models/room";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const room = await Room.create(payload);

    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create room.";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
