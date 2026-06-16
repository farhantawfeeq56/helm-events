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
      default: "open",
    },
    reportedAt: {
      type: Date,
      required: true,
    },
    // ─── Hermes enrichment (optional) ──────────────────────────────────────
    // Populated when an incident originates from the Hermes agent. Lets the
    // detail/list UI render the full operational card without a separate store.
    title: {
      type: String,
      trim: true,
    },
    // Human-readable slug used in incident URLs (the agent's kebab-case id).
    slug: {
      type: String,
      trim: true,
      index: true,
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
  },
  {
    timestamps: true,
  },
);

export type IncidentDocument = InferSchemaType<typeof incidentSchema>;

export const Incident = models.Incident || model("Incident", incidentSchema);
