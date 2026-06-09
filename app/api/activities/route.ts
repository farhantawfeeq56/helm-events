import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Activity } from "@/models/activity";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(Activity, request, {}, ["user", "action", "target", "details"]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch activities.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const activity = await Activity.create(payload);

    return NextResponse.json({ success: true, data: activity }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create activity.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
