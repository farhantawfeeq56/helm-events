import { model, models, Schema, type InferSchemaType } from "mongoose";

const incidentSchema = new Schema(
  {
    // Optional so Hermes can log an incident even before an event is configured.
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "Severity must be one of: low, medium, high, critical.",
      },
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: {
        values: ["open", "investigating", "mitigated", "resolved", "closed"],
        message: "Status must be one of: open, investigating, mitigated, resolved, closed.",
      },
      default: "open",
    },
    // Defaulted so an incident can never be logged without a report time.
    reportedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // ─── Hermes enrichment (optional) ──────────────────────────────────────
    // Populated when an incident originates from the Hermes agent. Lets the
    // detail/list UI render the full operational card without a separate store.
    title: {
      type: String,
      trim: true,
    },
    // Human-readable slug used in incident URLs (the agent's kebab-case id).
    // Unique when present; manual incidents may omit it (sparse).
    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    source: {
      type: String,
      trim: true,
      default: "manual", // "manual" | "hermes"
    },
    // Full Hermes `incidentData` (impactAnalysis, responseOptions,
    // riskAssessment, communications, etc.). Stored as-is for the UI.
    analysis: {
      type: Schema.Types.Mixed,
    },
    // Field staff who have acknowledged this incident ("I'm aware / on it").
    // Surfaced to organizers as real situational-awareness signal.
    acknowledgedBy: [
      new Schema(
        {
          name: { type: String, required: true },
          role: { type: String, default: "volunteer" },
          at: { type: Date, default: Date.now },
        },
        { _id: false },
      ),
    ],
  },
  {
    timestamps: true,
  },
);

export type IncidentDocument = InferSchemaType<typeof incidentSchema>;

export const Incident = models.Incident || model("Incident", incidentSchema);
