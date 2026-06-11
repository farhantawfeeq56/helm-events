import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/notification";
import { getPaginatedResponse } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get("recipient");

    const query: Record<string, string> = {};
    if (recipient) {
      query.recipient = recipient;
    }

    return getPaginatedResponse(
      Notification,
      request,
      query,
      ["title", "message"],
      []
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch notifications.";

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
    const notification = await Notification.create(payload);

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create notification.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
