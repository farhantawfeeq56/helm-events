import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/task";
import { Volunteer } from "@/models/volunteer";
import { logActivity } from "@/lib/activity-logger";
import { sendNotification, type SendNotificationInput } from "@/lib/notification-service";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { maybeRecordSnapshot } from "@/lib/services/metrics-service";
import { errorResponse, IntegrityError } from "@/lib/validation/errors";

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Task operational workflows — reassignment, escalation, blocking, deadline
 * extension, and operational recovery. Every action is attributed to the
 * signed-in actor, notifies the affected people, writes a specific entry to the
 * activity history (target `task:<id>` so it lands on the task timeline), and
 * captures a metrics snapshot.
 *
 *   POST body: { action: "reassign"|"escalate"|"block"|"recover"|"extend", ... }
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const action = String(body.action || "").toLowerCase();

    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    const actor = session?.name || "Operations";
    const actorLabel = session?.role ? `${actor} (${cap(session.role)})` : actor;

    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    const eventId = task.eventId ? String(task.eventId) : null;

    // Confirms a name is a real volunteer on this event before assigning to them.
    const requireVolunteer = async (name: string) => {
      if (!eventId) return;
      const vol = await Volunteer.findOne({ eventId, fullName: name }).select("_id").lean();
      if (!vol) {
        throw new IntegrityError(`No volunteer named "${name}" is registered for this event.`, 400, { assignedTo: "Unknown volunteer." });
      }
    };

    const updates: Record<string, unknown> = {};
    const notifications: SendNotificationInput[] = [];
    let activityAction = "task_updated";
    let details = "";

    switch (action) {
      case "reassign": {
        const newAssignee = String(body.assignedTo || "").trim();
        const reason = String(body.reason || "").trim();
        if (!newAssignee) throw new IntegrityError("A new assignee is required.", 400, { assignedTo: "Required." });
        if (newAssignee === task.assignedTo) throw new IntegrityError("That person is already assigned to this task.", 400, { assignedTo: "Already assigned." });
        await requireVolunteer(newAssignee);

        const old = task.assignedTo || "Unassigned";
        updates.assignedTo = newAssignee;
        if (reason) updates.assignmentReason = `Reassigned by ${actor}: ${reason}`;
        activityAction = "task_reassigned";
        details = `${actorLabel} reassigned task "${task.title}" from ${old} to ${newAssignee}` + (reason ? ` · Reason: ${reason}` : "");
        notifications.push({ recipient: newAssignee, type: "task_assigned", title: "Task Reassigned to You", message: `${actor} reassigned you: ${task.title}`, priority: task.priority === "high" ? "high" : "medium", sourceId: id, link: "/volunteer/tasks" });
        if (task.assignedTo && task.assignedTo !== newAssignee) {
          notifications.push({ recipient: task.assignedTo, type: "task_updated", title: "Task Reassigned Away", message: `"${task.title}" was reassigned to ${newAssignee}.`, priority: "low", sourceId: id });
        }
        break;
      }

      case "escalate": {
        const reason = String(body.reason || "").trim();
        const newLevel = (task.escalationLevel || 0) + 1;
        const newPriority = task.priority === "low" ? "medium" : "high";
        updates.status = "escalated";
        updates.escalationLevel = newLevel;
        updates.priority = newPriority;
        activityAction = "task_escalated";
        details =
          `${actorLabel} escalated task "${task.title}" to level ${newLevel}` +
          (task.priority !== newPriority ? ` (priority ${task.priority} → ${newPriority})` : "") +
          (reason ? ` · Reason: ${reason}` : "");
        if (task.assignedTo) notifications.push({ recipient: task.assignedTo, type: "task_escalated", title: "Task Escalated", message: `"${task.title}" has been escalated${reason ? `: ${reason}` : ""}.`, priority: "urgent", sourceId: id, link: "/volunteer/tasks" });
        if (task.assignedBy) notifications.push({ recipient: task.assignedBy, type: "system_alert", title: "Task Escalation", message: `${actor} escalated "${task.title}" (level ${newLevel}).`, priority: "urgent", sourceId: id, link: `/operations/tasks/${id}` });
        break;
      }

      case "block": {
        const reason = String(body.reason || "").trim();
        if (!reason) throw new IntegrityError("A blocker reason is required.", 400, { reason: "Required." });
        updates.status = "blocked";
        updates.blockedReason = reason;
        activityAction = "task_blocked";
        details = `${actorLabel} flagged task "${task.title}" as BLOCKED · Reason: ${reason}`;
        if (task.assignedBy) notifications.push({ recipient: task.assignedBy, type: "task_blocked", title: "Task Blocked", message: `"${task.title}" is blocked: ${reason}`, priority: "high", sourceId: id, link: `/operations/tasks/${id}` });
        break;
      }

      case "recover": {
        // Operational recovery: get a blocked / overdue / escalated task moving.
        const newAssignee = String(body.assignedTo || "").trim();
        const note = String(body.note || "").trim();
        const parts: string[] = [];
        updates.status = "in-progress";
        updates.blockedReason = "";

        if (newAssignee && newAssignee !== task.assignedTo) {
          await requireVolunteer(newAssignee);
          updates.assignedTo = newAssignee;
          parts.push(`reassigned to ${newAssignee}`);
          notifications.push({ recipient: newAssignee, type: "task_assigned", title: "Recovered Task Assigned", message: `${actor} handed you a recovered task: ${task.title}`, priority: task.priority === "high" ? "high" : "medium", sourceId: id, link: "/volunteer/tasks" });
        }
        if (body.dueAt) {
          updates.dueAt = new Date(body.dueAt);
          parts.push(`new deadline ${new Date(body.dueAt).toLocaleString()}`);
        }
        activityAction = "task_recovered";
        details = `${actorLabel} recovered task "${task.title}" → in progress` + (parts.length ? ` · ${parts.join(" · ")}` : "") + (note ? ` · Note: ${note}` : "");
        const stayingAssignee = task.assignedTo;
        if (!newAssignee && stayingAssignee) {
          notifications.push({ recipient: stayingAssignee, type: "task_recovered", title: "Task Recovered", message: `"${task.title}" is unblocked and back in progress.`, priority: "medium", sourceId: id, link: "/volunteer/tasks" });
        }
        break;
      }

      case "extend": {
        if (!body.dueAt) throw new IntegrityError("A new due date is required.", 400, { dueAt: "Required." });
        const newDue = new Date(body.dueAt);
        if (Number.isNaN(newDue.getTime())) throw new IntegrityError("Invalid due date.", 400, { dueAt: "Invalid date." });
        const reason = String(body.reason || "").trim();
        updates.dueAt = newDue;
        activityAction = "task_deadline_set";
        details = `${actorLabel} set the deadline for "${task.title}" to ${newDue.toLocaleString()}` + (reason ? ` · Reason: ${reason}` : "");
        if (task.assignedTo) notifications.push({ recipient: task.assignedTo, type: "task_updated", title: "Deadline Updated", message: `New deadline for "${task.title}": ${newDue.toLocaleString()}.`, priority: "low", sourceId: id, link: "/volunteer/tasks" });
        break;
      }

      default:
        throw new IntegrityError(`Unknown task action: "${action || "(none)"}".`, 400);
    }

    const updated = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true, context: "query" })
      .populate("incidentId")
      .populate("eventId");

    await logActivity({ user: actor, type: "human", action: activityAction, target: `task:${id}`, details }).catch(() => {});
    for (const n of notifications) await sendNotification(n).catch(() => {});
    if (eventId) await maybeRecordSnapshot(eventId, { trigger: activityAction }).catch(() => {});

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return errorResponse(error);
  }
}
