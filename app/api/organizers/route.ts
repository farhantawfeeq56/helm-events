import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Organizer } from "@/models/organizer";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";
import { validateOrganizer } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(Organizer, request, {}, ["fullName", "email", "organization"]);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch organizers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    await validateOrganizer(payload);
    const organizer = await Organizer.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "organizer",
      details: `Created organizer: ${organizer.fullName}`,
    });

    return NextResponse.json({ success: true, data: organizer }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
