import { NextResponse } from "next/server";

import { withRoleAuthorization } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/lib/models/task";

export const GET = withRoleAuthorization(
  ["volunteer", "organizer", "admin"],
  async ({ user }) => {
    try {
      await connectToDatabase();
      const query =
        user.role === "volunteer" ? { assignedTo: user.name ?? "" } : {};
      const tasks = await Task.find(query).sort({ createdAt: -1 });

      return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch tasks.";

      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);

export const POST = withRoleAuthorization(["organizer", "admin"], async ({
  request,
}) => {
  try {
    await connectToDatabase();
    const payload = await request.json();
    const task = await Task.create(payload);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create task.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
});
