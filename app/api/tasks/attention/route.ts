import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/task";
import { getActiveEvent } from "@/lib/context/contextService";
import { taskOpsState, dueLabel, TERMINAL_TASK_STATUSES } from "@/lib/tasks";

const EMPTY = { overdue: [], blocked: [], escalated: [], counts: { overdue: 0, blocked: 0, escalated: 0, total: 0 } };

/**
 * The organizer "needs attention" feed for the active event: tasks that are
 * blocked, overdue (delayed execution), or escalated — each surfaced once, with
 * its computed overdue duration and ownership. Powers the Task Operations board.
 */
export async function GET() {
  try {
    const event = await getActiveEvent().catch(() => null);
    if (!event?._id) {
      return NextResponse.json({ success: true, data: EMPTY, eventName: null });
    }
    await connectToDatabase();

    const tasks = (await Task.find({ eventId: event._id, status: { $nin: TERMINAL_TASK_STATUSES } })
      .select("title status priority assignedTo assignedBy dueAt blockedReason escalationLevel incidentId updatedAt")
      .limit(300)
      .lean()) as Array<Record<string, unknown>>;

    const now = new Date();
    const overdue: unknown[] = [];
    const blocked: unknown[] = [];
    const escalated: unknown[] = [];

    for (const t of tasks) {
      const s = taskOpsState(t as { status?: string; dueAt?: string; escalationLevel?: number }, now);
      if (!s.atRisk) continue;
      const item = {
        _id: String(t._id),
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assignedTo || "",
        assignedBy: t.assignedBy || "",
        dueAt: t.dueAt || null,
        dueLabel: dueLabel(t as { status?: string; dueAt?: string }, now),
        blockedReason: t.blockedReason || "",
        escalationLevel: t.escalationLevel || 0,
        minutesOverdue: s.minutesOverdue,
        overdue: s.overdue,
      };
      // Each task appears once, by its most urgent risk.
      if (s.escalated) escalated.push(item);
      else if (s.blocked) blocked.push(item);
      else if (s.overdue) overdue.push(item);
    }

    // Sort overdue by how late, escalated/blocked by priority.
    const rank = (x: unknown) => ({ high: 0, medium: 1, low: 2 }[((x as { priority?: string }).priority as string) || "low"] ?? 3);
    const byPriority = (a: unknown, b: unknown) => rank(a) - rank(b);
    overdue.sort((a, b) => (b as { minutesOverdue: number }).minutesOverdue - (a as { minutesOverdue: number }).minutesOverdue);
    blocked.sort(byPriority);
    escalated.sort(byPriority);

    return NextResponse.json({
      success: true,
      eventName: (event as { name?: string }).name || null,
      data: {
        overdue,
        blocked,
        escalated,
        counts: { overdue: overdue.length, blocked: blocked.length, escalated: escalated.length, total: overdue.length + blocked.length + escalated.length },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load attention feed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
