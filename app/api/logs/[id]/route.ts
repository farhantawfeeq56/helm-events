import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { APILog } from "@/models/api-log";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    await APILog.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete log" },
      { status: 500 }
    );
  }
}
