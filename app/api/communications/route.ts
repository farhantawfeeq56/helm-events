import { NextResponse } from "next/server";

import { withRoleAuthorization } from "@/lib/auth/authorization";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/lib/models/incident";
import { Task } from "@/lib/models/task";

export const GET = withRoleAuthorization(
  ["organizer", "admin"],
  async () => {
    try {
      await connectToDatabase();
      const [incidents, tasks] = await Promise.all([
        Incident.find().sort({ reportedAt: -1 }).limit(10).lean(),
        Task.find().sort({ createdAt: -1 }).limit(10).lean(),
      ]);

      const communications = [
        ...incidents.map((incident) => ({
          message: `Incident update: ${incident.type} is ${incident.status}.`,
          referenceId: String(incident._id),
          type: "incident",
        })),
        ...tasks.map((task) => ({
          message: `Task update: ${task.title} assigned to ${task.assignedTo || "unassigned"}.`,
          referenceId: String(task._id),
          type: "task",
        })),
      ].slice(0, 20);

      return NextResponse.json(communications, { status: 200 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch communications.";

      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
);
