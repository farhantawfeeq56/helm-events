import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Session } from "@/models/session";

export async function GET() {
  try {
    await connectToDatabase();
    const sessions = await Session.find({})
      .populate("speakerIds")
      .populate("roomId")
      .sort({ startTime: 1 });
    return NextResponse.json({ success: true, data: sessions });
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
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create session.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
