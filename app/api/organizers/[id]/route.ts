import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Organizer } from "@/models/organizer";
import { logActivity } from "@/lib/activity-logger";
import { validateOrganizer } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const organizer = await Organizer.findById(id);
    if (!organizer) {
      return NextResponse.json(
        { success: false, error: "Organizer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: organizer });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch organizer" },
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

    const existing = await Organizer.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Organizer not found" },
        { status: 404 }
      );
    }
    await validateOrganizer(payload, { id, existing: existing.toObject() });

    const organizer = await Organizer.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });

    await logActivity({
      user: "Admin",
      type: "human",
      action: "update",
      target: "organizer",
      details: `Updated organizer: ${organizer.fullName}`,
    });

    return NextResponse.json({ success: true, data: organizer });
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
    const organizer = await Organizer.findByIdAndDelete(id);
    if (!organizer) {
      return NextResponse.json(
        { success: false, error: "Organizer not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "delete",
      target: "organizer",
      details: `Deleted organizer: ${organizer.fullName}`,
    });

    return NextResponse.json({ success: true, data: organizer });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete organizer" },
      { status: 500 }
    );
  }
}
