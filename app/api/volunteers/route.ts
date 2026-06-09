import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Volunteer } from "@/models/volunteer";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(Volunteer, request, {}, ["fullName", "email", "role"]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch volunteers.";

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
    const volunteer = await Volunteer.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "volunteer",
      details: `Created volunteer: ${volunteer.fullName}`,
    });

    return NextResponse.json({ success: true, data: volunteer }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create volunteer.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
