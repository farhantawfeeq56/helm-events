import { model, models, Schema, type InferSchemaType } from "mongoose";

/**
 * A coordination message on an incident — the shared thread where field
 * volunteers and organizers post real-time updates ("crowd clearing", "need
 * backup at Hall B"). Mirrors TaskMessage so the UI patterns stay consistent.
 */
const incidentMessageSchema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
      index: true,
    },
    sender: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export type IncidentMessageDocument = InferSchemaType<typeof incidentMessageSchema>;

export const IncidentMessage =
  models.IncidentMessage || model("IncidentMessage", incidentMessageSchema);
