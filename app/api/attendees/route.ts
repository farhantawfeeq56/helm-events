import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Attendee } from "@/models/attendee";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(Attendee, request, {}, ["fullName", "email", "organization"]);
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

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "attendee",
      details: `Created attendee: ${attendee.fullName}`,
    });

    return NextResponse.json({ success: true, data: attendee }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create attendee.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
