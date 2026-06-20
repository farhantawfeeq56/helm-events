import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { Task } from "@/models/task";
import { Volunteer } from "@/models/volunteer";
import { Organizer } from "@/models/organizer";
import { Shift } from "@/models/shift";
import { Activity } from "@/models/activity";
import { MetricSnapshot } from "@/models/metric-snapshot";
import { getShiftDisplayStatus } from "@/lib/shifts";
import type { MetricValues } from "@/types/data-hub";

const ACTIVE_INCIDENT = ["open", "investigating", "mitigated"];

function round(n: number): number {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/**
 * Computes the current operational metrics for an event straight from live data.
 * Pure read — no side effects. Returns zeroed metrics on any failure so callers
 * (and the UI) degrade gracefully rather than break.
 */
export async function computeEventMetrics(eventId: string): Promise<MetricValues> {
  const empty: MetricValues = {
    incidentsTotal: 0, incidentsOpen: 0, incidentsActive: 0, incidentsResolved: 0,
    incidentsAcknowledged: 0, incidentResolutionRate: 0,
    tasksTotal: 0, tasksOpen: 0, tasksInProgress: 0, tasksCompleted: 0,
    taskCompletionRate: 0, avgTaskCompletionMins: 0,
    volunteersTotal: 0, volunteersActive: 0, volunteersOnShift: 0, organizersTotal: 0,
    shiftsTotal: 0, shiftsActive: 0,
    hermesIncidents: 0, hermesActions: 0, actionsLastHour: 0, operationalReadiness: 0,
  };

  try {
    await connectToDatabase();
    const oid = new Types.ObjectId(eventId);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [
      incidentGroups,
      incidentsAcknowledged,
      hermesIncidents,
      taskGroups,
      taskTiming,
      volunteersTotal,
      volunteersActive,
      organizersTotal,
      shiftDocs,
      hermesActions,
      actionsLastHour,
    ] = await Promise.all([
      Incident.aggregate([{ $match: { eventId: oid } }, { $group: { _id: { $toLower: "$status" }, n: { $sum: 1 } } }]),
      Incident.countDocuments({ eventId: oid, "acknowledgedBy.0": { $exists: true } }),
      Incident.countDocuments({ eventId: oid, source: "hermes" }),
      Task.aggregate([{ $match: { eventId: oid } }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
      Task.aggregate([
        { $match: { eventId: oid, status: "completed" } },
        { $project: { mins: { $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 60000] } } },
        { $group: { _id: null, avg: { $avg: "$mins" } } },
      ]),
      Volunteer.countDocuments({ eventId: oid }),
      Volunteer.countDocuments({ eventId: oid, status: "Active" }),
      Organizer.countDocuments({ eventId: oid }),
      Shift.find({ eventId: oid }).select("status date startTime endTime assignedTo").lean(),
      Activity.countDocuments({ type: "agent" }),
      Activity.countDocuments({ timestamp: { $gte: hourAgo } }),
    ]);

    const incCount = (s: string) => (incidentGroups.find((g) => g._id === s)?.n ?? 0) as number;
    const incidentsTotal = incidentGroups.reduce((a, g) => a + (g.n as number), 0);
    const incidentsOpen = incCount("open");
    const incidentsActive = ACTIVE_INCIDENT.reduce((a, s) => a + incCount(s), 0);
    const incidentsResolved = incCount("resolved") + incCount("closed");

    const taskCount = (s: string) => (taskGroups.find((g) => g._id === s)?.n ?? 0) as number;
    const tasksTotal = taskGroups.reduce((a, g) => a + (g.n as number), 0);
    const tasksOpen = taskCount("open");
    const tasksInProgress = taskCount("in-progress");
    const tasksCompleted = taskCount("completed");
    const avgTaskCompletionMins = round((taskTiming[0]?.avg as number) || 0);

    // Active shifts now + the distinct people currently on duty.
    let shiftsActive = 0;
    const onShift = new Set<string>();
    for (const s of shiftDocs as Array<{ status?: string; date?: string; startTime?: string; endTime?: string; assignedTo?: string }>) {
      if (getShiftDisplayStatus(s) === "in-progress") {
        shiftsActive += 1;
        if (s.assignedTo) onShift.add(s.assignedTo);
      }
    }

    const taskCompletionRate = pct(tasksCompleted, tasksTotal);
    const incidentResolutionRate = pct(incidentsResolved, incidentsTotal);

    // Composite health: lean on what's actually pending. No work pending → full marks.
    const taskScore = tasksTotal > 0 ? taskCompletionRate : 100;
    const incScore = incidentsTotal > 0 ? incidentResolutionRate : 100;
    const incidentPenalty = Math.min(100, incidentsActive * 15);
    const operationalReadiness = Math.max(
      0,
      Math.min(100, Math.round(0.4 * taskScore + 0.3 * incScore + 0.3 * (100 - incidentPenalty))),
    );

    return {
      incidentsTotal,
      incidentsOpen,
      incidentsActive,
      incidentsResolved,
      incidentsAcknowledged,
      incidentResolutionRate,
      tasksTotal,
      tasksOpen,
      tasksInProgress,
      tasksCompleted,
      taskCompletionRate,
      avgTaskCompletionMins,
      volunteersTotal,
      volunteersActive,
      volunteersOnShift: onShift.size,
      organizersTotal,
      shiftsTotal: shiftDocs.length,
      shiftsActive,
      hermesIncidents,
      hermesActions,
      actionsLastHour,
      operationalReadiness,
    };
  } catch (error) {
    console.error("computeEventMetrics failed:", error);
    return empty;
  }
}

/** Computes and persists a snapshot. Never throws — returns null on failure. */
export async function recordSnapshot(
  eventId: string,
  opts: { source?: "auto" | "event" | "manual"; trigger?: string } = {},
): Promise<unknown | null> {
  try {
    const metrics = await computeEventMetrics(eventId);
    return await MetricSnapshot.create({
      eventId,
      capturedAt: new Date(),
      source: opts.source || "auto",
      trigger: opts.trigger || "",
      metrics,
    });
  } catch (error) {
    console.error("recordSnapshot failed:", error);
    return null;
  }
}

/**
 * Records a snapshot only if the most recent one for this event is older than
 * `minIntervalMs`. Lets operational events (a task completing, an incident being
 * acknowledged) drive history capture without flooding the series. Throttle
 * check is a single indexed lookup; aggregation only runs when we actually write.
 */
export async function maybeRecordSnapshot(
  eventId: string,
  opts: { trigger?: string; source?: "auto" | "event" | "manual"; minIntervalMs?: number } = {},
): Promise<boolean> {
  const minIntervalMs = opts.minIntervalMs ?? 60_000;
  try {
    await connectToDatabase();
    const latest = (await MetricSnapshot.findOne({ eventId })
      .sort({ capturedAt: -1 })
      .select("capturedAt")
      .lean()) as { capturedAt?: Date } | null;
    if (latest?.capturedAt && Date.now() - new Date(latest.capturedAt).getTime() < minIntervalMs) {
      return false;
    }
    await recordSnapshot(eventId, { source: opts.source || "event", trigger: opts.trigger });
    return true;
  } catch (error) {
    console.error("maybeRecordSnapshot failed:", error);
    return false;
  }
}
