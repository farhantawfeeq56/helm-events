import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { Task } from "@/models/task";
import { TERMINAL_TASK_STATUSES } from "@/lib/tasks";
import type { ChecklistItem } from "@/lib/hermes";

/**
 * Live execution state for an incident: its linked Task records mapped to
 * checklist steps with their current status, plus a derived headline
 * ("2/3 steps complete"). The in-chat Execution Monitor polls this so the
 * checklist reflects real field progress instead of a one-time snapshot.
 *
 * `id` may be the Hermes slug (kebab-case) or a Mongo ObjectId.
 */

/** Map a Task's status onto the 3-state checklist vocabulary. */
function toChecklistStatus(taskStatus: string): ChecklistItem["status"] {
  const s = (taskStatus || "").toLowerCase();
  if (s === "completed" || s === "cancelled") return "completed";
  if (s === "in-progress" || s === "blocked" || s === "escalated") return "in-progress";
  return "pending";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Resolve the incident by slug first, then ObjectId.
    let incident = await Incident.findOne({ slug: id }).lean<{ _id: unknown } | null>();
    if (!incident && Types.ObjectId.isValid(id)) {
      incident = await Incident.findById(id).lean<{ _id: unknown } | null>();
    }

    if (!incident) {
      // No persisted incident yet (e.g. tasks not dispatched). Honest empty state.
      return NextResponse.json({
        success: true,
        linked: false,
        steps: [],
        total: 0,
        completed: 0,
        blocked: 0,
        executionStatus: "Awaiting task dispatch.",
      });
    }

    const tasks = await Task.find({ incidentId: incident._id })
      .sort({ createdAt: 1 })
      .lean<
        Array<{
          title?: string;
          status?: string;
          assignedTo?: string;
          blockedReason?: string;
        }>
      >();

    const steps: ChecklistItem[] = tasks.map((t) => {
      const assignee = (t.assignedTo || "").trim();
      const base = t.title || "Task";
      return {
        text: assignee ? `${base} — ${assignee}` : base,
        status: toChecklistStatus(t.status || "open"),
      };
    });

    const total = tasks.length;
    const completed = tasks.filter((t) =>
      TERMINAL_TASK_STATUSES.includes((t.status || "").toLowerCase())
    ).length;
    const blocked = tasks.filter((t) => (t.status || "").toLowerCase() === "blocked").length;

    let executionStatus: string;
    if (total === 0) {
      executionStatus = "No tasks dispatched yet.";
    } else if (completed === total) {
      executionStatus = "All steps complete.";
    } else {
      const blockedNote = blocked > 0 ? ` · ${blocked} blocked` : "";
      executionStatus = `${completed}/${total} steps complete${blockedNote}`;
    }

    return NextResponse.json({
      success: true,
      linked: total > 0,
      steps,
      total,
      completed,
      blocked,
      executionStatus,
    });
  } catch (error) {
    console.error("GET /api/incidents/[id]/execution failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load execution state" },
      { status: 500 }
    );
  }
}
