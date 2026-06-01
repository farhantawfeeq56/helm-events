import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Volunteer } from "@/models/volunteer";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const volunteer = await Volunteer.create(payload);

    return NextResponse.json({ success: true, data: volunteer }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create volunteer.";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
