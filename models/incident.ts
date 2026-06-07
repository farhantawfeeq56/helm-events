import { model, models, Schema, type InferSchemaType } from "mongoose";

const incidentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      required: true,
      default: "Open",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    impactAnalysis: {
      type: [String],
      default: [],
    },
    reportedById: {
      type: Schema.Types.ObjectId,
      refPath: "reporterModel",
    },
    reporterModel: {
      type: String,
      enum: ["Volunteer", "Organizer"],
      default: "Volunteer",
    },
    assignedTeamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  },
  {
    timestamps: true,
  },
);

export type IncidentDocument = InferSchemaType<typeof incidentSchema>;

export const Incident = models.Incident || model("Incident", incidentSchema);
