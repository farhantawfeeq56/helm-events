import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TaskMessage } from "@/models/task-message";
import { logActivity } from "@/lib/activity-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const messages = await TaskMessage.find({ taskId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching task messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const message = await TaskMessage.create({
      taskId: id,
      sender: body.sender,
      content: body.content,
      attachments: body.attachments || [],
      mentions: body.mentions || [],
    });

    await logActivity({
      user: body.sender.name,
      type: "human",
      action: "SENT_MESSAGE",
      target: `task:${id}`,
      details: `Sent a message in task discussion`,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating task message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { userId } = await request.json();

    await TaskMessage.updateMany(
      { taskId: id, "readBy.userId": { $ne: userId } },
      { $push: { readBy: { userId, timestamp: new Date() } } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
