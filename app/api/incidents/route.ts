import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/lib/models/incident";
import { logActivity } from "@/lib/activity-logger";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const query: any = {};
    if (eventId) query.eventId = eventId;

    const incidents = await Incident.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: incidents });
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
    const message =
      error instanceof Error ? error.message : "Unable to create incident.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
