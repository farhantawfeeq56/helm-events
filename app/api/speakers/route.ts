import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Speaker } from "@/models/speaker";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const speaker = await Speaker.create(payload);

    return NextResponse.json({ success: true, data: speaker }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create speaker.";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
