import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Sponsor } from "@/models/sponsor";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const sponsor = await Sponsor.create(payload);

    return NextResponse.json({ success: true, data: sponsor }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create sponsor.";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
