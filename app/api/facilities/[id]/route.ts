import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Facility } from "@/models/facility";
import { logActivity } from "@/lib/activity-logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const facility = await Facility.findById(id);
    if (!facility) {
      return NextResponse.json(
        { success: false, error: "Facility not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: facility });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch facility" },
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
    const facility = await Facility.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!facility) {
      return NextResponse.json(
        { success: false, error: "Facility not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "update",
      target: "facility",
      details: `Updated facility: ${facility.name}`,
    });

    return NextResponse.json({ success: true, data: facility });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update facility" },
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
    const facility = await Facility.findByIdAndDelete(id);
    if (!facility) {
      return NextResponse.json(
        { success: false, error: "Facility not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "delete",
      target: "facility",
      details: `Deleted facility: ${facility.name}`,
    });

    return NextResponse.json({ success: true, data: facility });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete facility" },
      { status: 500 }
    );
  }
}
