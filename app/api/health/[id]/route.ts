import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SystemHealth } from "@/models/system-health";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = await request.json();
    const health = await SystemHealth.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return NextResponse.json({ success: true, data: health });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update health record" },
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
    await SystemHealth.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete health record" },
      { status: 500 }
    );
  }
}
