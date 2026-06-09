import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { APILog } from "@/models/api-log";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(APILog, request, {}, ["method", "path"]);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const log = await APILog.create(payload);
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to create log" },
      { status: 400 }
    );
  }
}
