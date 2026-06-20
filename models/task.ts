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
    // Plain-English rationale for why this person was selected, produced by the
    // intelligent assignment engine. Surfaced in the task detail views.
    assignmentReason: {
      type: String,
      trim: true,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    // Deadline for execution. Drives overdue / delayed-execution detection.
    dueAt: {
      type: Date,
    },
    // Why a task is blocked (set when status → blocked, cleared on recovery).
    blockedReason: {
      type: String,
      trim: true,
      default: "",
    },
    // How many times this task has been escalated (0 = never).
    escalationLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export type TaskDocument = InferSchemaType<typeof taskSchema>;

export const Task: Model<TaskDocument> = models.Task || model<TaskDocument>("Task", taskSchema);
