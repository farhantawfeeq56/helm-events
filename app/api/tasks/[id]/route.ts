import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/task";
import { logActivity } from "@/lib/activity-logger";
import { sendNotification } from "@/lib/notification-service";
import { NotificationType } from "@/types/data-hub";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { validateTask } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";
import { maybeRecordSnapshot } from "@/lib/services/metrics-service";

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

    await validateTask(payload, { id, existing: oldTask.toObject() });

    const task = await Task.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    }).populate("incidentId").populate("eventId");
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    // Who is making this change (volunteer or organizer), for a precise audit trail.
    const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(sessionToken);
    const actor = session?.name || "Operations";
    const actorRole = session?.role ? session.role.charAt(0).toUpperCase() + session.role.slice(1) : "";
    const actorLabel = actorRole ? `${actor} (${actorRole})` : actor;

    let details = `${actorLabel} updated task "${task.title}".`;
    if (payload.status && payload.status !== oldTask.status) {
      const verb = payload.status === "completed" ? "marked as completed" : `moved to "${payload.status}"`;
      details =
        `${actorLabel} ${verb} the task "${task.title}" (was "${oldTask.status}")` +
        (task.assignedTo ? ` · Assigned to: ${task.assignedTo}` : "") +
        ` · Priority: ${task.priority || "medium"}`;
      
      // Trigger notification for status change
      if (task.assignedTo) {
        let type: NotificationType = "task_updated";
        let title = "Task Updated";
        const message = `Task "${task.title}" status changed to ${task.status}`;
        let priority: "low" | "medium" | "high" | "urgent" = task.priority === "high" ? "high" : "medium";

        if (task.status === "escalated") {
          type = "task_escalated";
          title = "Task Escalated";
          priority = "urgent";
        } else if (task.status === "completed") {
          type = "task_completed";
          title = "Task Completed";
        }

        await sendNotification({
          recipient: task.assignedTo,
          type,
          title,
          message,
          priority,
          sourceId: task._id.toString(),
          link: `/volunteer/tasks/${task._id}`,
        });
      }
    }

    // Trigger notification if assignment changed
    if (payload.assignedTo && payload.assignedTo !== oldTask.assignedTo) {
      details = `${actorLabel} reassigned task "${task.title}" from ${oldTask.assignedTo || "Unassigned"} to ${payload.assignedTo} · Priority: ${task.priority || "medium"}`;
      await sendNotification({
        recipient: payload.assignedTo,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `${actorLabel} assigned you the task: ${task.title}`,
        priority: task.priority === "high" ? "high" : "medium",
        sourceId: task._id.toString(),
        link: `/volunteer/tasks/${task._id}`,
      });
    }

    await logActivity({
      user: actor,
      type: "human",
      action:
        payload.status === "completed"
          ? "task_completed"
          : payload.status && payload.status !== oldTask.status
            ? "task_status_changed"
            : payload.assignedTo && payload.assignedTo !== oldTask.assignedTo
              ? "task_reassigned"
              : "task_updated",
      target: `task:${task._id}`,
      details,
    });

    // A task changing state is real operational progress — capture it (throttled).
    if (payload.status && payload.status !== oldTask.status && oldTask.eventId) {
      await maybeRecordSnapshot(String(oldTask.eventId), { trigger: `task_${payload.status}` });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return errorResponse(error);
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
