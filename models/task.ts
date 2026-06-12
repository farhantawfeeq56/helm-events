import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const taskSchema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: "Incident",
      required: false, // Make incident optional since tasks can now be event-level
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["open", "in-progress", "completed", "blocked", "cancelled", "escalated"],
      default: "open",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    objective: {
      type: String,
      trim: true,
      default: "",
    },
    expectedOutcome: {
      type: String,
      trim: true,
      default: "",
    },
    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },
    assignedBy: {
      type: String,
      trim: true,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
);

export type TaskDocument = InferSchemaType<typeof taskSchema>;

export const Task: Model<TaskDocument> = models.Task || model<TaskDocument>("Task", taskSchema);
