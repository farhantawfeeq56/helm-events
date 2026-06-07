import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";

export async function GET() {
  try {
    await connectToDatabase();
    const incidents = await Incident.find({})
      .populate("reportedById")
      .populate("assignedTeamId")
      .populate("locationId")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: incidents });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const incident = await Incident.create(payload);
    return NextResponse.json({ success: true, data: incident }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create incident.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
