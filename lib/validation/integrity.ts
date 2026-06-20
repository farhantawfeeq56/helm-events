import { Types, Model } from "mongoose";
import { Event } from "@/models/event";
import { Incident } from "@/models/incident";
import { Task } from "@/models/task";
import { Volunteer } from "@/models/volunteer";
import { Organizer } from "@/models/organizer";
import { Shift } from "@/models/shift";
import { Session } from "@/models/session";
import { IntegrityError } from "./errors";

/**
 * INTEGRITY LAYER
 *
 * Cross-document rules that schema validation can't enforce on its own:
 *   - referenced documents actually exist (no broken foreign keys)
 *   - relationships stay consistent (a task's incident is on the same event)
 *   - no duplicates within a scope (one email per person per event)
 *   - records can't be deleted out from under things that depend on them
 *
 * Every check throws an {@link IntegrityError} with clear, field-level messages.
 */

const ACTIVE_TASK_STATUSES = ["open", "in-progress", "blocked", "escalated"];

type AnyModel = Model<unknown>;

interface ValidateOpts {
  /** The id being updated, so uniqueness checks can exclude the record itself. */
  id?: string;
  /** The current persisted doc, to fill gaps on partial updates. */
  existing?: Record<string, unknown>;
}

/** True only for a syntactically valid, existing referenced document. */
async function refExists(model: AnyModel, id: unknown): Promise<boolean> {
  if (!id || !Types.ObjectId.isValid(String(id))) return false;
  return Boolean(await model.exists({ _id: id }));
}

function throwIf(fieldErrors: Record<string, string>): void {
  const keys = Object.keys(fieldErrors);
  if (keys.length === 0) return;
  const summary = fieldErrors[keys[0]];
  throw new IntegrityError(summary, keys.length && summary.includes("already exists") ? 409 : 400, fieldErrors);
}

function timeToMinutes(t: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

// ─── Event ───────────────────────────────────────────────────────────────────

export async function validateEvent(payload: Record<string, unknown>, opts: ValidateOpts = {}): Promise<void> {
  const errors: Record<string, string> = {};
  const start = (payload.startDate ?? opts.existing?.startDate) as string | undefined;
  const end = (payload.endDate ?? opts.existing?.endDate) as string | undefined;
  if (start && end && new Date(end).getTime() < new Date(start).getTime()) {
    errors.endDate = "End date cannot be before the start date.";
  }
  throwIf(errors);
}

export async function assertEventDeletable(eventId: string): Promise<void> {
  const [incidents, tasks, volunteers, organizers, shifts, sessions] = await Promise.all([
    Incident.countDocuments({ eventId }),
    Task.countDocuments({ eventId }),
    Volunteer.countDocuments({ eventId }),
    Organizer.countDocuments({ eventId }),
    Shift.countDocuments({ eventId }),
    Session.countDocuments({ eventId }),
  ]);
  const deps: string[] = [];
  if (incidents) deps.push(`${incidents} incident(s)`);
  if (tasks) deps.push(`${tasks} task(s)`);
  if (volunteers) deps.push(`${volunteers} volunteer(s)`);
  if (organizers) deps.push(`${organizers} organizer(s)`);
  if (shifts) deps.push(`${shifts} shift(s)`);
  if (sessions) deps.push(`${sessions} session(s)`);
  if (deps.length) {
    throw new IntegrityError(
      `Cannot delete this event — it still has ${deps.join(", ")}. Remove or reassign them first.`,
      409,
    );
  }
}

// ─── Incident ─────────────────────────────────────────────────────────────────

export async function validateIncident(payload: Record<string, unknown>, opts: ValidateOpts = {}): Promise<void> {
  const errors: Record<string, string> = {};
  if (payload.eventId && !(await refExists(Event, payload.eventId))) {
    errors.eventId = "Referenced event does not exist.";
  }
  if (payload.slug) {
    const dup = await Incident.findOne({
      slug: payload.slug,
      ...(opts.id ? { _id: { $ne: opts.id } } : {}),
    })
      .select("_id")
      .lean();
    if (dup) errors.slug = `An incident with the identifier "${payload.slug}" already exists.`;
  }
  throwIf(errors);
}

export async function assertIncidentDeletable(incidentId: string): Promise<void> {
  const tasks = await Task.countDocuments({ incidentId });
  if (tasks) {
    throw new IntegrityError(
      `Cannot delete this incident — ${tasks} task(s) still reference it. Reassign or remove those tasks first.`,
      409,
    );
  }
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export async function validateTask(payload: Record<string, unknown>, opts: ValidateOpts = {}): Promise<void> {
  const errors: Record<string, string> = {};
  const taskEventId = (payload.eventId ?? opts.existing?.eventId) as unknown;

  if (payload.eventId !== undefined && !(await refExists(Event, payload.eventId))) {
    errors.eventId = "Referenced event does not exist.";
  }

  if (payload.incidentId) {
    if (!Types.ObjectId.isValid(String(payload.incidentId))) {
      errors.incidentId = "Invalid incident reference.";
    } else {
      const inc = (await Incident.findById(payload.incidentId).select("eventId").lean()) as
        | { eventId?: unknown }
        | null;
      if (!inc) {
        errors.incidentId = "Referenced incident does not exist.";
      } else if (inc.eventId && taskEventId && String(inc.eventId) !== String(taskEventId)) {
        errors.incidentId = "This incident belongs to a different event than the task.";
      }
    }
  }
  throwIf(errors);
}

// ─── Volunteer / Organizer (shared "person on an event" rules) ───────────────

async function validatePerson(
  model: AnyModel,
  label: string,
  payload: Record<string, unknown>,
  opts: ValidateOpts,
): Promise<void> {
  const errors: Record<string, string> = {};
  const eventId = (payload.eventId ?? opts.existing?.eventId) as unknown;

  if (payload.eventId !== undefined && !(await refExists(Event, payload.eventId))) {
    errors.eventId = "Referenced event does not exist.";
  }

  const email = payload.email ? String(payload.email).trim().toLowerCase() : "";
  if (email && eventId) {
    const dup = await model
      .findOne({
        eventId,
        email,
        ...(opts.id ? { _id: { $ne: opts.id } } : {}),
      })
      .select("_id")
      .lean();
    if (dup) errors.email = `A ${label} with this email already exists for this event.`;
  }
  throwIf(errors);
}

export function validateVolunteer(payload: Record<string, unknown>, opts: ValidateOpts = {}): Promise<void> {
  return validatePerson(Volunteer, "volunteer", payload, opts);
}

export function validateOrganizer(payload: Record<string, unknown>, opts: ValidateOpts = {}): Promise<void> {
  return validatePerson(Organizer, "organizer", payload, opts);
}

export async function assertVolunteerDeletable(volunteerId: string): Promise<void> {
  const vol = (await Volunteer.findById(volunteerId).select("fullName").lean()) as { fullName?: string } | null;
  if (!vol?.fullName) return;
  const [tasks, shifts] = await Promise.all([
    Task.countDocuments({ assignedTo: vol.fullName, status: { $in: ACTIVE_TASK_STATUSES } }),
    Shift.countDocuments({ assignedTo: vol.fullName, status: { $ne: "cancelled" } }),
  ]);
  const deps: string[] = [];
  if (tasks) deps.push(`${tasks} active task(s)`);
  if (shifts) deps.push(`${shifts} shift(s)`);
  if (deps.length) {
    throw new IntegrityError(
      `Cannot delete ${vol.fullName} — they still have ${deps.join(" and ")} assigned. Reassign those first.`,
      409,
    );
  }
}

// ─── Shift ────────────────────────────────────────────────────────────────────

export async function validateShift(payload: Record<string, unknown>, opts: ValidateOpts = {}): Promise<void> {
  const errors: Record<string, string> = {};
  const eventId = (payload.eventId ?? opts.existing?.eventId) as unknown;

  if (payload.eventId !== undefined && !(await refExists(Event, payload.eventId))) {
    errors.eventId = "Referenced event does not exist.";
  }

  const start = (payload.startTime ?? opts.existing?.startTime) as string | undefined;
  const end = (payload.endTime ?? opts.existing?.endTime) as string | undefined;
  if (start && end) {
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);
    if (s !== null && e !== null && s >= e) {
      errors.endTime = "Shift end time must be after the start time.";
    }
  }

  const assignedTo = payload.assignedTo as string | undefined;
  if (assignedTo && eventId) {
    const vol = await Volunteer.findOne({ eventId, fullName: assignedTo }).select("_id").lean();
    if (!vol) errors.assignedTo = `No volunteer named "${assignedTo}" is registered for this event.`;
  }
  throwIf(errors);
}
