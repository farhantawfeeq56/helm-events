import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { Task } from "@/models/task";
import { Volunteer } from "@/models/volunteer";
import { Shift } from "@/models/shift";
import { Activity } from "@/models/activity";
import { isShiftActiveNow } from "@/lib/shifts";
import { taskOpsState, ACTIVE_TASK_STATUSES } from "@/lib/tasks";
import type {
  EventHealth,
  HealthGrade,
  EventHealthStatus,
  HealthComponent,
  HealthIncident,
  HealthAttentionItem,
  HealthVolunteerLoad,
} from "@/types/data-hub";

/**
 * OPERATIONAL HEALTH
 *
 * A real-time, at-a-glance read of how an active event is doing right now —
 * composed entirely from live records (incidents, tasks, volunteers, shifts,
 * activity). Distinct from the metrics service (trends over time) and the
 * analytics service (retrospective deep-dive): this answers "what's the state
 * of the event this minute, and what needs me?"
 *
 * The headline score is a transparent blend of four component scores so the UI
 * can show exactly what is dragging health down. Every input is a real document
 * the platform produced — no placeholder values.
 */

const ACTIVE_INCIDENT = ["open", "investigating", "mitigated"];
const RESOLVED = ["resolved", "closed"];
const URGENT_SEVERITY = ["high", "critical"];
const STALE_INCIDENT_MINS = 30;
const OVERLOADED_AT = 4; // active tasks on one person before we flag overload
const SEV_RANK: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}
function round(n: number): number {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}
function mean(xs: number[]): number {
  return xs.length ? round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
}
function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}
function minsSince(d?: string | Date | null): number {
  if (!d) return 0;
  return Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000));
}

function gradeFor(score: number): HealthGrade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}
function statusFor(score: number): EventHealthStatus {
  if (score >= 85) return "Healthy";
  if (score >= 70) return "Stable";
  if (score >= 50) return "Strained";
  if (score >= 30) return "At Risk";
  return "Critical";
}

interface IncidentDoc {
  _id: unknown;
  type?: string;
  title?: string;
  slug?: string;
  severity?: string;
  status?: string;
  source?: string;
  reportedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  acknowledgedBy?: Array<{ name?: string; at?: string | Date }>;
}
interface TaskDoc {
  _id: unknown;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueAt?: string | Date;
  escalationLevel?: number;
  blockedReason?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export async function computeEventHealth(eventId: string, eventName: string | null = null): Promise<EventHealth> {
  const empty: EventHealth = {
    hasData: false,
    eventName,
    score: 100,
    grade: "A",
    status: "Healthy",
    components: [],
    incidents: { total: 0, active: 0, resolved: 0, unacknowledgedUrgent: 0, critical: 0, list: [] },
    tasks: { total: 0, completed: 0, inProgress: 0, open: 0, blocked: 0, escalated: 0, overdue: 0, unassigned: 0, completionRate: 0, atRisk: 0 },
    workforce: { total: 0, active: 0, onShiftNow: 0, withActiveWork: 0, unassignedActiveTasks: 0, load: [] },
    response: { incidentResolutionRate: 0, mttrMins: 0, avgAckMins: 0, acknowledgedRate: 0, taskCompletionRate: 0, avgTaskCompletionMins: 0, actionsLastHour: 0 },
    attention: [],
    attentionTotal: 0,
    generatedAt: new Date().toISOString(),
  };

  try {
    await connectToDatabase();
    const oid = new Types.ObjectId(eventId);
    const now = new Date();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [incidents, tasks, vols, shiftDocs, actionsLastHour] = await Promise.all([
      Incident.find({ eventId: oid }).select("type title slug severity status source reportedAt createdAt updatedAt acknowledgedBy").lean() as Promise<IncidentDoc[]>,
      Task.find({ eventId: oid }).select("status priority assignedTo dueAt escalationLevel blockedReason createdAt updatedAt").lean() as Promise<TaskDoc[]>,
      Volunteer.find({ eventId: oid }).select("fullName role status").lean() as Promise<Array<{ fullName?: string; role?: string; status?: string }>>,
      Shift.find({ eventId: oid }).select("assignedTo date startTime endTime status").lean() as Promise<Array<{ assignedTo?: string; date?: string; startTime?: string; endTime?: string; status?: string }>>,
      Activity.countDocuments({ timestamp: { $gte: hourAgo } }),
    ]);

    // ── Incidents ────────────────────────────────────────────────────────────
    const activeIncidents = incidents.filter((i) => ACTIVE_INCIDENT.includes((i.status || "").toLowerCase()));
    const resolvedIncidents = incidents.filter((i) => RESOLVED.includes((i.status || "").toLowerCase()));
    const isAcked = (i: IncidentDoc) => (i.acknowledgedBy?.length || 0) > 0;

    const incidentList: HealthIncident[] = activeIncidents
      .map((i) => ({
        _id: String(i._id),
        slug: i.slug,
        title: i.title || i.type || "Incident",
        type: i.type || "",
        severity: ((i.severity || "low").toLowerCase() as HealthIncident["severity"]),
        status: (i.status || "open").toLowerCase(),
        source: i.source || "manual",
        ageMins: minsSince(i.reportedAt || i.createdAt),
        acknowledged: isAcked(i),
        staleMins: minsSince(i.updatedAt),
      }))
      .sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity] || b.ageMins - a.ageMins);

    const activeCritical = incidentList.filter((i) => i.severity === "critical");
    const unackUrgent = activeIncidents.filter((i) => URGENT_SEVERITY.includes((i.severity || "").toLowerCase()) && !isAcked(i));

    // Resolution timing + acknowledgement timing (live equivalents of the analytics math).
    const resolveTimes: number[] = [];
    for (const i of resolvedIncidents) {
      const start = i.reportedAt || i.createdAt;
      if (start && i.updatedAt) {
        const m = (new Date(i.updatedAt).getTime() - new Date(start).getTime()) / 60000;
        if (m >= 0) resolveTimes.push(m);
      }
    }
    const ackTimes: number[] = [];
    let ackedCount = 0;
    for (const i of incidents) {
      const first = i.acknowledgedBy?.[0];
      if (first?.at) {
        ackedCount++;
        const start = i.reportedAt || i.createdAt;
        if (start) {
          const m = (new Date(first.at).getTime() - new Date(start).getTime()) / 60000;
          if (m >= 0) ackTimes.push(m);
        }
      }
    }

    // ── Tasks ────────────────────────────────────────────────────────────────
    const completed = tasks.filter((t) => t.status === "completed");
    const inProgress = tasks.filter((t) => t.status === "in-progress");
    const open = tasks.filter((t) => t.status === "open");
    const blocked = tasks.filter((t) => t.status === "blocked");
    const escalated = tasks.filter((t) => t.status === "escalated");
    const activeTasks = tasks.filter((t) => ACTIVE_TASK_STATUSES.includes((t.status || "").toLowerCase()));

    let overdue = 0;
    let atRisk = 0;
    for (const t of activeTasks) {
      const s = taskOpsState(t as { status?: string; dueAt?: string | Date; escalationLevel?: number }, now);
      if (s.overdue) overdue++;
      if (s.atRisk) atRisk++;
    }
    const unassignedActive = activeTasks.filter((t) => !t.assignedTo).length;

    const completionTimes = completed
      .map((t) => (t.createdAt && t.updatedAt ? (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / 60000 : null))
      .filter((x): x is number => x !== null && x >= 0);

    const taskCompletionRate = pct(completed.length, tasks.length);
    const incidentResolutionRate = pct(resolvedIncidents.length, incidents.length);

    // ── Workforce / workload ───────────────────────────────────────────────────
    const onShiftNames = new Set<string>();
    for (const s of shiftDocs) if (s.assignedTo && isShiftActiveNow(s, now)) onShiftNames.add(s.assignedTo);

    const activeByVol = new Map<string, TaskDoc[]>();
    for (const t of activeTasks) {
      if (!t.assignedTo) continue;
      const arr = activeByVol.get(t.assignedTo) || [];
      arr.push(t);
      activeByVol.set(t.assignedTo, arr);
    }

    const load: HealthVolunteerLoad[] = vols
      .filter((v) => v.fullName)
      .map((v) => {
        const name = v.fullName as string;
        const mine = activeByVol.get(name) || [];
        let vOverdue = 0;
        let vBlocked = 0;
        for (const t of mine) {
          if (t.status === "blocked") vBlocked++;
          if (taskOpsState(t as { status?: string; dueAt?: string | Date }, now).overdue) vOverdue++;
        }
        return {
          name,
          role: v.role || "Volunteer",
          activeTasks: mine.length,
          overdue: vOverdue,
          blocked: vBlocked,
          onShift: onShiftNames.has(name),
          overloaded: mine.length >= OVERLOADED_AT,
        };
      })
      .filter((v) => v.activeTasks > 0)
      .sort((a, b) => b.activeTasks - a.activeTasks);

    const volunteersActive = vols.filter((v) => (v.status || "").toLowerCase() === "active").length;
    const capacity = onShiftNames.size > 0 ? onShiftNames.size : volunteersActive;
    const activeWorkload = activeTasks.length + activeIncidents.length;

    // ── Component scores (0-100) ───────────────────────────────────────────────
    const taskHealth = clamp((tasks.length > 0 ? taskCompletionRate : 100) - overdue * 4 - blocked.length * 7 - escalated.length * 9);
    const incidentHealth = incidents.length === 0
      ? 100
      : clamp(100 - activeIncidents.length * 10 - unackUrgent.length * 18 - activeCritical.length * 12);
    const staffingHealth = activeWorkload === 0
      ? 100
      : clamp(Math.round(((capacity * 2) / activeWorkload) * 100) - unassignedActive * 5);
    const ackSpeedScore = mean(ackTimes) > 0 ? clamp(Math.round(100 - (mean(ackTimes) / 45) * 100)) : (ackedCount > 0 ? 80 : 40);
    const responseHealth = incidents.length === 0 ? 100 : clamp(Math.round(0.5 * pct(ackedCount, incidents.length) + 0.5 * ackSpeedScore));

    const score = clamp(Math.round(0.34 * taskHealth + 0.3 * incidentHealth + 0.18 * staffingHealth + 0.18 * responseHealth));

    const components: HealthComponent[] = [
      { key: "tasks", label: "Task execution", score: Math.round(taskHealth), detail: `${completed.length}/${tasks.length} done · ${atRisk} at risk` },
      { key: "incidents", label: "Incident load", score: Math.round(incidentHealth), detail: `${activeIncidents.length} active · ${activeCritical.length} critical` },
      { key: "staffing", label: "Staffing coverage", score: Math.round(staffingHealth), detail: `${capacity} on duty vs ${activeWorkload} active items` },
      { key: "response", label: "Response", score: Math.round(responseHealth), detail: incidents.length ? `${pct(ackedCount, incidents.length)}% acknowledged · ${mean(ackTimes)}m avg` : "No incidents to respond to" },
    ];

    // ── Areas requiring attention (prioritized) ────────────────────────────────
    const attention: HealthAttentionItem[] = [];
    for (const i of incidentList) {
      const urgentUnacked = URGENT_SEVERITY.includes(i.severity) && !i.acknowledged;
      if (i.severity === "critical" || urgentUnacked) {
        attention.push({
          id: `inc-${i._id}`,
          severity: "critical",
          category: "incident",
          title: `${i.severity === "critical" ? "Critical" : "Urgent"} incident: ${i.title}`,
          detail: `${i.status} · ${i.ageMins}m old${i.acknowledged ? "" : " · unacknowledged"}`,
          link: `/incidents/${i.slug ?? i._id}`,
        });
      }
    }
    if (escalated.length) attention.push({ id: "task-escalated", severity: "high", category: "task", title: `${escalated.length} escalated task${escalated.length === 1 ? "" : "s"}`, detail: "Needs a lead or priority attention", link: "/operations/task-operations" });
    if (blocked.length) attention.push({ id: "task-blocked", severity: "high", category: "task", title: `${blocked.length} blocked task${blocked.length === 1 ? "" : "s"}`, detail: "Execution halted — awaiting unblock", link: "/operations/task-operations" });
    if (capacity > 0 && activeWorkload > capacity * 2) attention.push({ id: "staffing", severity: "high", category: "staffing", title: "Understaffed for current load", detail: `${capacity} on duty vs ${activeWorkload} active items`, link: "/operations/task-operations" });
    else if (capacity === 0 && activeWorkload > 0) attention.push({ id: "staffing-none", severity: "high", category: "staffing", title: "No one on duty", detail: `${activeWorkload} active items with no active shift`, link: "?collection=shifts" });
    if (overdue) attention.push({ id: "task-overdue", severity: overdue >= 5 ? "high" : "medium", category: "task", title: `${overdue} overdue task${overdue === 1 ? "" : "s"}`, detail: "Past deadline, still active", link: "/operations/task-operations" });
    if (unassignedActive) attention.push({ id: "task-unassigned", severity: "medium", category: "task", title: `${unassignedActive} unassigned active task${unassignedActive === 1 ? "" : "s"}`, detail: "No owner — needs assignment", link: "/operations/task-operations" });
    const staleIncidents = incidentList.filter((i) => i.staleMins >= STALE_INCIDENT_MINS).length;
    if (staleIncidents) attention.push({ id: "inc-stale", severity: "medium", category: "incident", title: `${staleIncidents} stale incident${staleIncidents === 1 ? "" : "s"}`, detail: `No update in ${STALE_INCIDENT_MINS}m+`, link: "/incidents" });

    attention.sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity]);

    const hasData = incidents.length > 0 || tasks.length > 0 || vols.length > 0;

    return {
      hasData,
      eventName,
      score,
      grade: gradeFor(score),
      status: statusFor(score),
      components,
      incidents: {
        total: incidents.length,
        active: activeIncidents.length,
        resolved: resolvedIncidents.length,
        unacknowledgedUrgent: unackUrgent.length,
        critical: activeCritical.length,
        list: incidentList.slice(0, 12),
      },
      tasks: {
        total: tasks.length,
        completed: completed.length,
        inProgress: inProgress.length,
        open: open.length,
        blocked: blocked.length,
        escalated: escalated.length,
        overdue,
        unassigned: unassignedActive,
        completionRate: taskCompletionRate,
        atRisk,
      },
      workforce: {
        total: vols.length,
        active: volunteersActive,
        onShiftNow: onShiftNames.size,
        withActiveWork: load.length,
        unassignedActiveTasks: unassignedActive,
        load: load.slice(0, 12),
      },
      response: {
        incidentResolutionRate,
        mttrMins: mean(resolveTimes),
        avgAckMins: mean(ackTimes),
        acknowledgedRate: pct(ackedCount, incidents.length),
        taskCompletionRate,
        avgTaskCompletionMins: mean(completionTimes),
        actionsLastHour,
      },
      attention,
      attentionTotal: attention.length,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("computeEventHealth failed:", error);
    return empty;
  }
}
