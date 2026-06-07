import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Organizer } from "@/models/organizer";

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
    const organizer = await Organizer.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!organizer) {
      return NextResponse.json(
        { success: false, error: "Organizer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: organizer });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update organizer" },
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
    const organizer = await Organizer.findByIdAndDelete(id);
    if (!organizer) {
      return NextResponse.json(
        { success: false, error: "Organizer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: organizer });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete organizer" },
      { status: 500 }
    );
  }
}
