import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Sponsor } from "@/models/sponsor";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const query = eventId ? { eventId } : {};

    const sponsors = await Sponsor.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: sponsors });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch sponsors" },
      { status: 500 }
    );
  }
}

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
