import { NextResponse } from "next/server";

/**
 * Thrown by the integrity layer for referential / relationship / duplicate
 * problems that schema validation alone can't express. Carries an HTTP status
 * and optional per-field messages so the UI can render them inline.
 */
export class IntegrityError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "IntegrityError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface NormalizedError {
  status: number;
  error: string;
  fieldErrors?: Record<string, string>;
}

// Human-friendly labels for fields that show up in duplicate-key / cast errors.
const FIELD_LABELS: Record<string, string> = {
  email: "email",
  slug: "identifier",
  name: "name",
  eventId: "event",
  incidentId: "incident",
  assignedTo: "assignee",
  fullName: "name",
  companyName: "company name",
};

function label(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

/**
 * Converts any thrown error (Mongoose validation/cast/duplicate-key, our
 * IntegrityError, or an unknown failure) into a consistent, user-facing shape.
 */
export function normalizeDbError(error: unknown): NormalizedError {
  // Our own referential / relationship errors.
  if (error instanceof IntegrityError) {
    return { status: error.status, error: error.message, fieldErrors: error.fieldErrors };
  }

  const e = error as {
    name?: string;
    code?: number;
    message?: string;
    path?: string;
    value?: unknown;
    keyValue?: Record<string, unknown>;
    errors?: Record<string, { message?: string; path?: string; kind?: string }>;
  };

  // Duplicate key (unique index violation).
  if (e?.code === 11000) {
    const fields = e.keyValue ? Object.keys(e.keyValue) : [];
    const fieldErrors: Record<string, string> = {};
    for (const f of fields) {
      fieldErrors[f] = `A record with this ${label(f)} already exists.`;
    }
    const summary = fields.length
      ? `A record with the same ${fields.map(label).join(" + ")} already exists.`
      : "A duplicate record already exists.";
    return { status: 409, error: summary, fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined };
  }

  // Schema validation errors (enums, required, min/max, custom validators).
  if (e?.name === "ValidationError" && e.errors) {
    const fieldErrors: Record<string, string> = {};
    for (const [path, detail] of Object.entries(e.errors)) {
      fieldErrors[path] = detail?.message || `${label(path)} is invalid.`;
    }
    const summary = Object.values(fieldErrors)[0] || "Some fields are invalid.";
    return { status: 400, error: summary, fieldErrors };
  }

  // Bad ObjectId / type coercion (e.g. a malformed reference id).
  if (e?.name === "CastError") {
    const field = e.path || "field";
    return {
      status: 400,
      error: `Invalid value for ${label(field)}.`,
      fieldErrors: { [field]: `Invalid ${label(field)}.` },
    };
  }

  return { status: 500, error: e?.message || "An unexpected error occurred." };
}

/** Builds the standard `{ success:false, error, fieldErrors }` JSON response. */
export function errorResponse(error: unknown): NextResponse {
  const { status, error: message, fieldErrors } = normalizeDbError(error);
  if (status >= 500) {
    console.error("Unhandled API error:", error);
  }
  return NextResponse.json({ success: false, error: message, fieldErrors }, { status });
}
