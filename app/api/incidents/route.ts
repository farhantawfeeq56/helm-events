import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";
import { validateIncident } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(Incident, request, {}, ["description", "type", "severity", "status"]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch incidents.";

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
    await validateIncident(payload);
    const incident = await Incident.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "incident",
      details: `Created incident: ${incident.description.substring(0, 50)}`,
    });

    return NextResponse.json({ success: true, data: incident }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
