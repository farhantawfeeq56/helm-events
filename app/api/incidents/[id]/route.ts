import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { logActivity } from "@/lib/activity-logger";
import { validateIncident, assertIncidentDeletable } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const incident = await Incident.findById(id);
    if (!incident) {
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: incident });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = await request.json();

    await validateIncident(payload, { id });

    const incident = await Incident.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (!incident) {
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "update",
      target: "incident",
      details: `Updated incident: ${incident.description.substring(0, 50)}`,
    });

    return NextResponse.json({ success: true, data: incident });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Block deletion while tasks still reference this incident.
    await assertIncidentDeletable(id);

    const incident = await Incident.findByIdAndDelete(id);
    if (!incident) {
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "delete",
      target: "incident",
      details: `Deleted incident: ${incident.description.substring(0, 50)}`,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
