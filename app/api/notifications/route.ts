import { NextResponse } from "next/server";

import { withRoleAuthorization } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/lib/models/task";

export const GET = withRoleAuthorization(
  ["volunteer", "admin"],
  async ({ user }) => {
    try {
      await connectToDatabase();

      if (user.role === "admin") {
        const tasks = await Task.find().sort({ createdAt: -1 }).limit(20).lean();
        const notifications = tasks.map((task) => ({
          message: `${task.title} is ${task.status}.`,
          assignedTo: task.assignedTo,
          taskId: String(task._id),
          type: "task",
        }));

        return NextResponse.json(notifications, { status: 200 });
      }

      const tasks = await Task.find({ assignedTo: user.name ?? "" })
        .sort({ createdAt: -1 })
        .lean();

      const notifications = tasks.map((task) => ({
        message: `${task.title} is ${task.status}.`,
        taskId: String(task._id),
        type: "task",
      }));

      return NextResponse.json(notifications, { status: 200 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch notifications.";

      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
