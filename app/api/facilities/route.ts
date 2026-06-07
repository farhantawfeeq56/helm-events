import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Facility } from "@/models/facility";

export async function GET() {
  try {
    await connectToDatabase();
    const facilities = await Facility.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: facilities });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const facility = await Facility.create(payload);

    return NextResponse.json({ success: true, data: facility }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create facility.";

    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
