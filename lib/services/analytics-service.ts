import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { Task } from "@/models/task";
import { Shift } from "@/models/shift";
import { Volunteer } from "@/models/volunteer";
import { Organizer } from "@/models/organizer";
import { Activity } from "@/models/activity";
import { IncidentMessage } from "@/models/incident-message";

/**
 * RESOLUTION ANALYTICS
 *
 * Retrospective performance analysis derived entirely from real platform
 * records — incidents, tasks, shifts, acknowledgements, coordination messages,
 * and the activity log. No mock or placeholder values: every number here is an
 * aggregation over documents the platform actually produced.
 *
 * Complements the live metrics service (current KPIs + trend snapshots) with
 * breakdowns, mean-time-to-resolve, and per-person contribution/workload.
 */

const RESOLVED = ["resolved", "closed"];
const ACTIVE_INCIDENT = ["open", "investigating", "mitigated"];

function round(n: number): number {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}
function mean(xs: number[]): number {
  return xs.length ? round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
}
function median(xs: number[]): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return round(s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2);
}
function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface IncidentDoc {
  _id: unknown;
  type?: string;
  severity?: string;
  status?: string;
  source?: string;
  reportedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  acknowledgedBy?: Array<{ name?: string; role?: string; at?: string | Date }>;
}
interface TaskDoc {
  status?: string;
  priority?: string;
  assignedTo?: string;
  assignedBy?: string;
  incidentId?: unknown;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ResolutionAnalytics {
  hasData: boolean;
  eventName: string | null;
  incidents: {
    total: number;
    resolved: number;
    active: number;
    resolutionRate: number;
    mttrMins: number;
    medianResolveMins: number;
    avgAckMins: number;
    acknowledgedRate: number;
    bySeverity: Array<{ key: string; total: number; resolved: number; mttrMins: number }>;
    byType: Array<{ key: string; total: number; resolved: number; mttrMins: number }>;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    open: number;
    completionRate: number;
    avgCompletionMins: number;
    medianCompletionMins: number;
    byPriority: Array<{ key: string; total: number; completed: number }>;
    byStatus: Array<{ key: string; count: number }>;
    throughput: Array<{ day: string; created: number; completed: number }>;
  };
  volunteers: Array<{
    name: string;
    role: string;
    tasksCompleted: number;
    avgTaskMins: number;
    acknowledgements: number;
    messages: number;
    shifts: number;
    score: number;
  }>;
  organizers: Array<{
    name: string;
    tasksDispatched: number;
    plansApproved: number;
    actions: number;
    score: number;
  }>;
  hermes: {
    incidentsDetected: number;
    detectionSharePct: number;
    resolved: number;
    resolutionRate: number;
    mttrMins: number;
    acknowledgedRate: number;
    agentActions: number;
    tasksFromHermes: number;
    plansFromHermes: number;
    manualResolutionRate: number;
  };
  generatedAt: string;
}

export async function computeResolutionAnalytics(eventId: string, eventName: string | null = null): Promise<ResolutionAnalytics> {
  const empty: ResolutionAnalytics = {
    hasData: false,
    eventName,
    incidents: { total: 0, resolved: 0, active: 0, resolutionRate: 0, mttrMins: 0, medianResolveMins: 0, avgAckMins: 0, acknowledgedRate: 0, bySeverity: [], byType: [] },
    tasks: { total: 0, completed: 0, inProgress: 0, open: 0, completionRate: 0, avgCompletionMins: 0, medianCompletionMins: 0, byPriority: [], byStatus: [], throughput: [] },
    volunteers: [],
    organizers: [],
    hermes: { incidentsDetected: 0, detectionSharePct: 0, resolved: 0, resolutionRate: 0, mttrMins: 0, acknowledgedRate: 0, agentActions: 0, tasksFromHermes: 0, plansFromHermes: 0, manualResolutionRate: 0 },
    generatedAt: new Date().toISOString(),
  };

  try {
    await connectToDatabase();
    const oid = new Types.ObjectId(eventId);

    const [incidents, tasks, shifts, vols, orgs, planAgg, agentActions, humanAgg] = await Promise.all([
      Incident.find({ eventId: oid }).select("type severity status source reportedAt createdAt updatedAt acknowledgedBy").lean() as Promise<IncidentDoc[]>,
      Task.find({ eventId: oid }).select("status priority assignedTo assignedBy incidentId createdAt updatedAt").lean() as Promise<TaskDoc[]>,
      Shift.find({ eventId: oid }).select("assignedTo").lean() as Promise<Array<{ assignedTo?: string }>>,
      Volunteer.find({ eventId: oid }).select("fullName role").lean() as Promise<Array<{ fullName?: string; role?: string }>>,
      Organizer.find({ eventId: oid }).select("fullName").lean() as Promise<Array<{ fullName?: string }>>,
      Activity.aggregate([{ $match: { action: "plan_approved" } }, { $group: { _id: "$user", n: { $sum: 1 } } }]),
      Activity.countDocuments({ type: "agent" }),
      Activity.aggregate([{ $match: { type: "human" } }, { $group: { _id: "$user", n: { $sum: 1 } } }]),
    ]);

    const incidentIds = incidents.map((i) => i._id as Types.ObjectId);
    const messages = (await IncidentMessage.find({ incidentId: { $in: incidentIds } })
      .select("sender")
      .lean()) as Array<{ sender?: { name?: string; role?: string } }>;

    const resolveMinsOf = (i: IncidentDoc): number | null => {
      const start = i.reportedAt || i.createdAt;
      const end = i.updatedAt;
      if (!start || !end) return null;
      const m = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
      return m >= 0 ? m : null;
    };

    // ── Incidents ──────────────────────────────────────────────────────────
    const resolvedIncidents = incidents.filter((i) => RESOLVED.includes((i.status || "").toLowerCase()));
    const activeIncidents = incidents.filter((i) => ACTIVE_INCIDENT.includes((i.status || "").toLowerCase()));
    const resolveTimes = resolvedIncidents.map(resolveMinsOf).filter((x): x is number => x !== null);

    const ackTimes: number[] = [];
    let acknowledgedCount = 0;
    for (const i of incidents) {
      const first = i.acknowledgedBy?.[0];
      if (first?.at) {
        acknowledgedCount++;
        const start = i.reportedAt || i.createdAt;
        if (start) {
          const m = (new Date(first.at).getTime() - new Date(start).getTime()) / 60000;
          if (m >= 0) ackTimes.push(m);
        }
      }
    }

    const groupIncidents = (keyFn: (i: IncidentDoc) => string) => {
      const map = new Map<string, { total: number; resolved: number; times: number[] }>();
      for (const i of incidents) {
        const k = keyFn(i) || "unspecified";
        const g = map.get(k) || { total: 0, resolved: 0, times: [] };
        g.total++;
        if (RESOLVED.includes((i.status || "").toLowerCase())) {
          g.resolved++;
          const t = resolveMinsOf(i);
          if (t !== null) g.times.push(t);
        }
        map.set(k, g);
      }
      return [...map.entries()]
        .map(([key, g]) => ({ key, total: g.total, resolved: g.resolved, mttrMins: mean(g.times) }))
        .sort((a, b) => b.total - a.total);
    };

    // ── Tasks ──────────────────────────────────────────────────────────────
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const completionTimes = completedTasks
      .map((t) => (t.createdAt && t.updatedAt ? (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / 60000 : null))
      .filter((x): x is number => x !== null && x >= 0);

    const statusCounts = new Map<string, number>();
    for (const t of tasks) statusCounts.set(t.status || "open", (statusCounts.get(t.status || "open") || 0) + 1);

    const priorityMap = new Map<string, { total: number; completed: number }>();
    for (const t of tasks) {
      const k = t.priority || "medium";
      const g = priorityMap.get(k) || { total: 0, completed: 0 };
      g.total++;
      if (t.status === "completed") g.completed++;
      priorityMap.set(k, g);
    }

    // Throughput over the last 7 days (created vs completed).
    const throughput: Array<{ day: string; created: number; completed: number }> = [];
    for (let d = 6; d >= 0; d--) {
      const day = new Date(Date.now() - d * 86400000);
      const key = dayKey(day);
      throughput.push({
        day: key,
        created: tasks.filter((t) => t.createdAt && dayKey(new Date(t.createdAt)) === key).length,
        completed: completedTasks.filter((t) => t.updatedAt && dayKey(new Date(t.updatedAt)) === key).length,
      });
    }

    // ── Volunteer contribution ───────────────────────────────────────────────
    const completedByVol = new Map<string, number[]>();
    for (const t of completedTasks) {
      if (!t.assignedTo) continue;
      const arr = completedByVol.get(t.assignedTo) || [];
      if (t.createdAt && t.updatedAt) {
        const m = (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()) / 60000;
        if (m >= 0) arr.push(m);
      }
      completedByVol.set(t.assignedTo, arr);
    }
    const acksByName = new Map<string, number>();
    for (const i of incidents) for (const a of i.acknowledgedBy || []) if (a.name) acksByName.set(a.name, (acksByName.get(a.name) || 0) + 1);
    const msgsByName = new Map<string, number>();
    for (const m of messages) { const n = m.sender?.name; if (n) msgsByName.set(n, (msgsByName.get(n) || 0) + 1); }
    const shiftsByName = new Map<string, number>();
    for (const s of shifts) if (s.assignedTo) shiftsByName.set(s.assignedTo, (shiftsByName.get(s.assignedTo) || 0) + 1);

    const volunteers = vols
      .filter((v) => v.fullName)
      .map((v) => {
        const name = v.fullName as string;
        const times = completedByVol.get(name) || [];
        const tasksCompleted = (completedTasks.filter((t) => t.assignedTo === name)).length;
        const acknowledgements = acksByName.get(name) || 0;
        const msgs = msgsByName.get(name) || 0;
        const sh = shiftsByName.get(name) || 0;
        const score = tasksCompleted * 3 + acknowledgements * 2 + msgs + sh;
        return { name, role: v.role || "Volunteer", tasksCompleted, avgTaskMins: mean(times), acknowledgements, messages: msgs, shifts: sh, score };
      })
      .filter((v) => v.score > 0)
      .sort((a, b) => b.score - a.score);

    // ── Organizer workload ───────────────────────────────────────────────────
    const dispatchedByOrg = new Map<string, number>();
    for (const t of tasks) if (t.assignedBy) dispatchedByOrg.set(t.assignedBy, (dispatchedByOrg.get(t.assignedBy) || 0) + 1);
    const plansByUser = new Map<string, number>(planAgg.map((r) => [r._id as string, r.n as number]));
    const actionsByUser = new Map<string, number>(humanAgg.map((r) => [r._id as string, r.n as number]));

    const orgNames = new Set<string>([...orgs.map((o) => o.fullName).filter(Boolean) as string[], ...dispatchedByOrg.keys(), ...plansByUser.keys()]);
    const organizers = [...orgNames]
      .map((name) => {
        const tasksDispatched = dispatchedByOrg.get(name) || 0;
        const plansApproved = plansByUser.get(name) || 0;
        const actions = actionsByUser.get(name) || 0;
        const score = plansApproved * 3 + tasksDispatched + Math.round(actions * 0.2);
        return { name, tasksDispatched, plansApproved, actions, score };
      })
      .filter((o) => o.score > 0)
      .sort((a, b) => b.score - a.score);

    // ── Hermes effectiveness ─────────────────────────────────────────────────
    const hermesIncidents = incidents.filter((i) => i.source === "hermes");
    const hermesIds = new Set(hermesIncidents.map((i) => String(i._id)));
    const hermesResolved = hermesIncidents.filter((i) => RESOLVED.includes((i.status || "").toLowerCase()));
    const hermesResolveTimes = hermesResolved.map(resolveMinsOf).filter((x): x is number => x !== null);
    const hermesAcked = hermesIncidents.filter((i) => (i.acknowledgedBy?.length || 0) > 0).length;
    const manualIncidents = incidents.filter((i) => i.source !== "hermes");
    const manualResolved = manualIncidents.filter((i) => RESOLVED.includes((i.status || "").toLowerCase())).length;
    const tasksFromHermes = tasks.filter((t) => t.incidentId && hermesIds.has(String(t.incidentId))).length;
    const plansFromHermes = new Set(tasks.filter((t) => t.incidentId && hermesIds.has(String(t.incidentId))).map((t) => String(t.incidentId))).size;

    const hasData = incidents.length > 0 || tasks.length > 0;

    return {
      hasData,
      eventName,
      incidents: {
        total: incidents.length,
        resolved: resolvedIncidents.length,
        active: activeIncidents.length,
        resolutionRate: pct(resolvedIncidents.length, incidents.length),
        mttrMins: mean(resolveTimes),
        medianResolveMins: median(resolveTimes),
        avgAckMins: mean(ackTimes),
        acknowledgedRate: pct(acknowledgedCount, incidents.length),
        bySeverity: groupIncidents((i) => (i.severity || "").toLowerCase()),
        byType: groupIncidents((i) => i.type || ""),
      },
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        open: tasks.filter((t) => t.status === "open").length,
        completionRate: pct(completedTasks.length, tasks.length),
        avgCompletionMins: mean(completionTimes),
        medianCompletionMins: median(completionTimes),
        byPriority: [...priorityMap.entries()].map(([key, g]) => ({ key, total: g.total, completed: g.completed })),
        byStatus: [...statusCounts.entries()].map(([key, count]) => ({ key, count })),
        throughput,
      },
      volunteers,
      organizers,
      hermes: {
        incidentsDetected: hermesIncidents.length,
        detectionSharePct: pct(hermesIncidents.length, incidents.length),
        resolved: hermesResolved.length,
        resolutionRate: pct(hermesResolved.length, hermesIncidents.length),
        mttrMins: mean(hermesResolveTimes),
        acknowledgedRate: pct(hermesAcked, hermesIncidents.length),
        agentActions,
        tasksFromHermes,
        plansFromHermes,
        manualResolutionRate: pct(manualResolved, manualIncidents.length),
      },
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("computeResolutionAnalytics failed:", error);
    return empty;
  }
}
