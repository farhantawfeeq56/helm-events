import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Speaker } from "@/models/speaker";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const speaker = await Speaker.findById(id);
    if (!speaker) {
      return NextResponse.json(
        { success: false, error: "Speaker not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: speaker });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch speaker" },
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
    const speaker = await Speaker.findByIdAndUpdate(id, payload, { new: true });
    if (!speaker) {
      return NextResponse.json(
        { success: false, error: "Speaker not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: speaker });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update speaker" },
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
    const speaker = await Speaker.findByIdAndDelete(id);
    if (!speaker) {
      return NextResponse.json(
        { success: false, error: "Speaker not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete speaker" },
      { status: 500 }
    );
  }
}
