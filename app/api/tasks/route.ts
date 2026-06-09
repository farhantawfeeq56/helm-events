import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { Task } from "@/lib/models/task";
import { logActivity } from "@/lib/activity-logger";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const incidentId = searchParams.get("incidentId");

    const query: any = {};
    if (eventId) query.eventId = eventId;
    if (incidentId) query.incidentId = incidentId;

    const tasks = await Task.find(query)
      .populate("incidentId")
      .populate("eventId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: tasks });
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
