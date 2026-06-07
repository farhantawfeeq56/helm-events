import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Team } from "@/models/team";

export async function GET() {
  try {
    await connectToDatabase();
    const teams = await Team.find({})
      .populate("leadId")
      .populate("memberIds")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const team = await Team.create(payload);
    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create team.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
