import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Sponsor } from "@/models/sponsor";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(Sponsor, request, {}, ["companyName", "contact", "tier"]);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch sponsors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const sponsor = await Sponsor.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "sponsor",
      details: `Created sponsor: ${sponsor.companyName}`,
    });

    return NextResponse.json({ success: true, data: sponsor }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create sponsor.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
