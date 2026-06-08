import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Speaker } from "@/models/speaker";

export async function GET() {
  try {
    await connectToDatabase();
    const speakers = await Speaker.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: speakers });
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
