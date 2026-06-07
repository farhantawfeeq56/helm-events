import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Attendee } from "@/models/attendee";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const attendee = await Attendee.findById(id);
    if (!attendee) {
      return NextResponse.json(
        { success: false, error: "Attendee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: attendee });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendee" },
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
    const attendee = await Attendee.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!attendee) {
      return NextResponse.json(
        { success: false, error: "Attendee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: attendee });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update attendee" },
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
    const attendee = await Attendee.findByIdAndDelete(id);
    if (!attendee) {
      return NextResponse.json(
        { success: false, error: "Attendee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete attendee" },
      { status: 500 }
    );
  }
}
