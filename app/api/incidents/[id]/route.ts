import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { logActivity } from "@/lib/activity-logger";

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
    const incident = await Incident.findByIdAndUpdate(id, payload, {
      new: true,
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
    return NextResponse.json(
      { success: false, error: "Failed to update incident" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
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
    return NextResponse.json(
      { success: false, error: "Failed to delete incident" },
      { status: 500 }
    );
  }
}
