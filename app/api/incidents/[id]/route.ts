import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";

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
    const incident = await Incident.findByIdAndUpdate(id, payload, { new: true });
    if (!incident) {
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 }
      );
    }
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
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete incident" },
      { status: 500 }
    );
  }
}
