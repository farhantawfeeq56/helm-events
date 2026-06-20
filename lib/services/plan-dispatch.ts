import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Task } from "@/models/task";
import { Volunteer } from "@/models/volunteer";
import { Incident } from "@/models/incident";
import { Shift } from "@/models/shift";
import { getActiveEvent } from "@/lib/context/contextService";
import { sendNotification } from "@/lib/notification-service";
import { logActivity } from "@/lib/activity-logger";
import { selectAssignee, type AssignmentCandidate } from "@/lib/services/task-assignment";
import { getShiftDisplayStatus } from "@/lib/shifts";
import { maybeRecordSnapshot } from "@/lib/services/metrics-service";

const ACTIVE_TASK_STATUSES = ["open", "in-progress", "blocked", "escalated"];

interface PlanStep {
  text?: string;
}

export interface DispatchPlanInput {
  incidentSlug?: string;
  planTitle?: string;
  steps?: Array<string | PlanStep>;
  priority?: string;
  /** The organizer approving the plan, recorded as each task's `assignedBy`. */
  assignedBy: string;
}

export interface DispatchPlanResult {
  success: boolean;
  count: number;
  assignments: { title: string; assignee: string; reason: string }[];
  error?: string;
}

/**
 * Turns an approved Hermes plan into real, assigned tasks. Shared by the agent
 * chat flow (`/api/tasks/assign-plan`) and the dedicated incident approval flow
 * (`/api/incidents/[id]/approve`) so both dispatch identically.
 *
 * Each step becomes a Task on the active event, assigned to the most appropriate
 * volunteer via the intelligent assignment engine — matching the work to each
 * person's role, shift, roster status, and current workload (see
 * `lib/services/task-assignment.ts`). The chosen person and the reasoning are
 * recorded on the task and in the activity log. Never throws — returns an error
 * field instead so callers can respond gracefully.
 */
export async function dispatchPlanTasks(input: DispatchPlanInput): Promise<DispatchPlanResult> {
  const { incidentSlug, planTitle, steps, priority, assignedBy } = input;

  const stepTexts: string[] = (Array.isArray(steps) ? steps : [])
    .map((s: string | PlanStep) => (typeof s === "string" ? s : s?.text))
    .filter((t): t is string => Boolean(t && t.trim()));

  if (stepTexts.length === 0) {
    return { success: false, count: 0, assignments: [], error: "No steps to assign." };
  }

  await connectToDatabase();

  const event = await getActiveEvent().catch(() => null);
  if (!event?._id) {
    return { success: false, count: 0, assignments: [], error: "No active event configured." };
  }
  const eventId = String(event._id);

  // Resolve the originating incident (optional) so tasks link back to it.
  let incidentId: string | undefined;
  let incidentTitle: string | undefined;
  if (incidentSlug) {
    const inc = (await Incident.findOne({ slug: incidentSlug })
      .select("_id title type")
      .lean()) as { _id?: unknown; title?: string; type?: string } | null;
    if (inc?._id) {
      incidentId = String(inc._id);
      incidentTitle = inc.title || inc.type;
    }
  }

  // Assignment pool: this event's volunteers, else any volunteers.
  let pool = (await Volunteer.find({ eventId })
    .select("fullName role shift status")
    .lean()) as Array<{ fullName?: string; role?: string; shift?: string; status?: string }>;
  if (pool.length === 0) {
    pool = (await Volunteer.find()
      .limit(25)
      .select("fullName role shift status")
      .lean()) as Array<{ fullName?: string; role?: string; shift?: string; status?: string }>;
  }

  // Current workload per volunteer (their open/in-progress/blocked/escalated
  // tasks) so the engine can balance load instead of overloading one person.
  const loadAgg = (await Task.aggregate([
    {
      $match: {
        eventId: new Types.ObjectId(eventId),
        status: { $in: ACTIVE_TASK_STATUSES },
        assignedTo: { $nin: ["", null] },
      },
    },
    { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
  ])) as Array<{ _id: string; count: number }>;
  const loadMap = new Map(loadAgg.map((r) => [r._id, r.count]));

  // Real shift coverage: who has a shift on this event, and who is on one right
  // now. Lets the engine route live work to people actually on duty.
  const shiftDocs = (await Shift.find({ eventId, status: { $ne: "cancelled" } })
    .select("assignedTo date startTime endTime status")
    .lean()) as Array<{ assignedTo?: string; date?: string; startTime?: string; endTime?: string; status?: string }>;
  const hasShift = new Set<string>();
  const onShiftNow = new Set<string>();
  for (const s of shiftDocs) {
    if (!s.assignedTo) continue;
    hasShift.add(s.assignedTo);
    if (getShiftDisplayStatus(s) === "in-progress") onShiftNow.add(s.assignedTo);
  }

  // Candidates the engine scores against; openTaskCount is mutated as we go so
  // a multi-step plan spreads across people rather than stacking on one.
  const candidates: AssignmentCandidate[] = pool
    .filter((v) => v.fullName)
    .map((v) => {
      const name = v.fullName as string;
      return {
        fullName: name,
        role: v.role,
        shift: v.shift,
        status: v.status,
        openTaskCount: loadMap.get(name) ?? 0,
        onShiftNow: hasShift.has(name) ? onShiftNow.has(name) : undefined,
      };
    });

  const normalizedPriority: "low" | "medium" | "high" = ["low", "medium", "high"].includes(priority as string)
    ? (priority as "low" | "medium" | "high")
    : "medium";
  const priorityLabel = normalizedPriority.charAt(0).toUpperCase() + normalizedPriority.slice(1);

  const assignments: { title: string; assignee: string; reason: string }[] = [];

  for (let i = 0; i < stepTexts.length; i++) {
    const pick = selectAssignee(candidates, {
      taskText: stepTexts[i],
      planTitle,
      incidentTitle,
      priority: normalizedPriority,
    });
    const chosen = pick.candidate;
    const assignee = chosen?.fullName || "";
    const reason = pick.reason;

    const task = await Task.create({
      eventId,
      incidentId,
      title: stepTexts[i],
      description: planTitle ? `Part of plan: ${planTitle}` : "",
      status: "open",
      priority: normalizedPriority,
      assignedTo: assignee,
      assignedBy,
      assignmentReason: assignee ? reason : "",
    });

    // Reflect the new load immediately so the next step balances around it.
    if (chosen) chosen.openTaskCount += 1;

    assignments.push({ title: stepTexts[i], assignee: assignee || "Unassigned", reason });

    // Specific, per-task audit entry — also surfaces on the task's own timeline.
    // Kept short: the priority and the "why" are the parts an organizer scans for.
    await logActivity({
      user: assignedBy,
      type: "human",
      action: "task_assigned",
      target: `task:${task._id}`,
      details:
        `${assignedBy} assigned "${stepTexts[i]}" to ${assignee || "Unassigned"}` +
        ` · ${priorityLabel} priority` +
        (assignee ? ` · ${reason}` : ""),
    }).catch(() => {});

    if (assignee) {
      await sendNotification({
        recipient: assignee,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `${assignedBy} assigned you: ${stepTexts[i]}`,
        priority: normalizedPriority === "high" ? "high" : "medium",
        sourceId: task._id.toString(),
        link: "/volunteer/tasks",
      }).catch(() => {});
    }
  }

  // Summary audit entry. Deliberately concise — the per-task assignments are
  // logged individually (above), so the summary stays a one-line headline.
  await logActivity({
    user: assignedBy,
    type: "human",
    action: "plan_approved",
    target: incidentSlug ? `incident:${incidentSlug}` : "operations",
    details:
      `${assignedBy} approved "${planTitle || "response plan"}" (${priorityLabel} priority)` +
      (incidentTitle ? ` · ${incidentTitle}` : "") +
      ` — ${assignments.length} task(s) dispatched`,
  }).catch(() => {});

  // Dispatching a response plan moves the operation — capture the moment.
  await maybeRecordSnapshot(eventId, { trigger: "plan_approved" }).catch(() => {});

  return { success: true, count: assignments.length, assignments };
}
