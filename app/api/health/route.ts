import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SystemHealth } from "@/models/system-health";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(SystemHealth, request, {}, ["service", "status"]);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch health data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const health = await SystemHealth.create(payload);
    return NextResponse.json({ success: true, data: health }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to create health record" },
      { status: 400 }
    );
  }
}
