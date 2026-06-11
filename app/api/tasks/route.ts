import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/task";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";
import { sendNotification } from "@/lib/notification-service";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    return getPaginatedResponse(
      Task,
      request,
      {},
      ["title", "assignedTo", "description"],
      ["incidentId", "eventId"]
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch tasks.";

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
    const task = await Task.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: "task",
      details: `Created task: ${task.title}`,
    });

    if (task.assignedTo) {
      await sendNotification({
        recipient: task.assignedTo,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${task.title}`,
        priority: task.priority === "high" ? "high" : "medium",
        sourceId: task._id.toString(),
        link: `/volunteer/tasks/${task._id}`,
      });
    }

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create task.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
