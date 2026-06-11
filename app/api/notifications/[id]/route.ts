import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/notification";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = await request.json();

    const notification = await Notification.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update notification.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete notification.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
