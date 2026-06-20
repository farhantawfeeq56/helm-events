/**
 * Shift time helpers — framework-agnostic so they're shared by the volunteer
 * view, the operations dashboard, and the task-assignment engine.
 *
 * A shift's *live* state is derived from its date/time window rather than stored,
 * so "on duty now" is always real. The stored `status` only overrides for
 * cancellation or an explicit early completion.
 */

export type ShiftDisplayStatus = "upcoming" | "in-progress" | "completed" | "cancelled";

export interface ShiftTiming {
  date?: string; // "YYYY-MM-DD"
  startTime?: string; // "HH:MM"
  endTime?: string; // "HH:MM"
  status?: string; // stored override
}

/** Today's date as "YYYY-MM-DD" in local time. */
function todayISO(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Combines a "YYYY-MM-DD" + "HH:MM" into a local Date, or null if unparseable. */
function toDateTime(date: string, time: string): Date | null {
  if (!time) return null;
  const [h, min] = time.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h)) return null;
  const [y, mo, d] = date.split("-").map((n) => parseInt(n, 10));
  if (Number.isNaN(y)) return null;
  return new Date(y, (mo || 1) - 1, d || 1, h, min || 0, 0, 0);
}

/**
 * Returns the live display status. Stored `cancelled`/`completed` always win;
 * otherwise it's derived from the window relative to `now`. With no date, the
 * shift is treated as scheduled for today so its times still drive the badge.
 */
export function getShiftDisplayStatus(shift: ShiftTiming, now: Date = new Date()): ShiftDisplayStatus {
  if (shift.status === "cancelled") return "cancelled";
  if (shift.status === "completed") return "completed";

  const date = shift.date && shift.date.trim() ? shift.date.trim() : todayISO(now);
  const start = shift.startTime ? toDateTime(date, shift.startTime) : null;
  const end = shift.endTime ? toDateTime(date, shift.endTime) : null;

  if (start && now < start) return "upcoming";
  if (end && now > end) return "completed";
  if ((start && now >= start) && (!end || now <= end)) return "in-progress";

  // Not enough timing info to derive — fall back to the stored intent.
  return shift.status === "in-progress" ? "in-progress" : "upcoming";
}

/** True if the shift's window currently includes `now` (and it isn't cancelled). */
export function isShiftActiveNow(shift: ShiftTiming, now: Date = new Date()): boolean {
  return getShiftDisplayStatus(shift, now) === "in-progress";
}
