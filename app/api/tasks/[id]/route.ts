import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/task";
import { logActivity } from "@/lib/activity-logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const task = await Task.findById(id).populate("incidentId").populate("eventId");
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: task });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = await request.json();
    const oldTask = await Task.findById(id);
    if (!oldTask) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const task = await Task.findByIdAndUpdate(id, payload, {
      new: true,
    }).populate("incidentId").populate("eventId");
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    let details = `Updated task: ${task.title}`;
    if (payload.status && payload.status !== oldTask.status) {
      details = `Status changed from ${oldTask.status} to ${payload.status} for task: ${task.title}`;
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "update",
      target: `task:${task._id}`,
      details,
    });

    return NextResponse.json({ success: true, data: task });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update task" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "delete",
      target: "task",
      details: `Deleted task: ${task.title}`,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
