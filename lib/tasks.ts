/**
 * Task operational-state helpers — framework-agnostic so they're shared by the
 * API (attention feed), the organizer control board, and the volunteer views.
 *
 * A task's "at-risk" state is derived, not stored: overdue is computed from the
 * deadline, while blocked/escalated come from status. This keeps the signal
 * always-accurate without a background job.
 */

export const ACTIVE_TASK_STATUSES = ["open", "in-progress", "blocked", "escalated"];
export const TERMINAL_TASK_STATUSES = ["completed", "cancelled"];

export interface TaskOpsInput {
  status?: string;
  dueAt?: string | Date | null;
  escalationLevel?: number;
}

export interface TaskOpsState {
  overdue: boolean;
  blocked: boolean;
  escalated: boolean;
  atRisk: boolean;
  minutesOverdue: number;
}

/** True when a task has a passed deadline and isn't already finished. */
export function isOverdue(task: TaskOpsInput, now: Date = new Date()): boolean {
  if (!task.dueAt) return false;
  if (TERMINAL_TASK_STATUSES.includes((task.status || "").toLowerCase())) return false;
  return new Date(task.dueAt).getTime() < now.getTime();
}

export function minutesOverdue(task: TaskOpsInput, now: Date = new Date()): number {
  if (!isOverdue(task, now)) return 0;
  return Math.round((now.getTime() - new Date(task.dueAt as string | Date).getTime()) / 60000);
}

export function taskOpsState(task: TaskOpsInput, now: Date = new Date()): TaskOpsState {
  const status = (task.status || "").toLowerCase();
  const overdue = isOverdue(task, now);
  const blocked = status === "blocked";
  const escalated = status === "escalated" || (task.escalationLevel ?? 0) > 0;
  return { overdue, blocked, escalated, atRisk: overdue || blocked || escalated, minutesOverdue: minutesOverdue(task, now) };
}

/** Human-friendly "2h 15m overdue" / "due in 30m" label. */
export function dueLabel(task: TaskOpsInput, now: Date = new Date()): string | null {
  if (!task.dueAt) return null;
  const diffMs = new Date(task.dueAt).getTime() - now.getTime();
  const mins = Math.round(Math.abs(diffMs) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const span = h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
  if (TERMINAL_TASK_STATUSES.includes((task.status || "").toLowerCase())) return null;
  return diffMs < 0 ? `${span} overdue` : `due in ${span}`;
}
