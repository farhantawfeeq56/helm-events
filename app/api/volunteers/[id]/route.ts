import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Volunteer } from "@/models/volunteer";
import { logActivity } from "@/lib/activity-logger";
import { validateVolunteer, assertVolunteerDeletable } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: volunteer });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch volunteer" },
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

    const existing = await Volunteer.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }
    await validateVolunteer(payload, { id, existing: existing.toObject() });

    const volunteer = await Volunteer.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });

    await logActivity({
      user: "Admin",
      type: "human",
      action: "update",
      target: "volunteer",
      details: `Updated volunteer: ${volunteer.fullName}`,
    });

    return NextResponse.json({ success: true, data: volunteer });
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

    // Block deletion while the volunteer still has active work assigned.
    await assertVolunteerDeletable(id);

    const volunteer = await Volunteer.findByIdAndDelete(id);
    if (!volunteer) {
      return NextResponse.json(
        { success: false, error: "Volunteer not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "delete",
      target: "volunteer",
      details: `Deleted volunteer: ${volunteer.fullName}`,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return errorResponse(error);
  }
}
