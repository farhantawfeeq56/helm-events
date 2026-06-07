import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { APILog } from "@/models/api-log";

export async function GET() {
  try {
    await connectToDatabase();
    const logs = await APILog.find({}).sort({ timestamp: -1 }).limit(100);
    return NextResponse.json({ success: true, data: logs });
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
