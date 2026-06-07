import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Analytics } from "@/models/analytics";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = await request.json();
    const metric = await Analytics.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return NextResponse.json({ success: true, data: metric });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update metric" },
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
    await Analytics.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete metric" },
      { status: 500 }
    );
  }
}
