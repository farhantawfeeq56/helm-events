import { model, models, Schema, type InferSchemaType } from "mongoose";

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
      default: "open",
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

export const Task = models.Task || model("Task", taskSchema);
