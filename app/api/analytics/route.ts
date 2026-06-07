import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Analytics } from "@/models/analytics";

export async function GET() {
  try {
    await connectToDatabase();
    const analytics = await Analytics.find({});
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const metric = await Analytics.create(payload);
    return NextResponse.json({ success: true, data: metric }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to create metric" },
      { status: 400 }
    );
  }
}
