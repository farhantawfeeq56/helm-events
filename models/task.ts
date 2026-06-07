import { model, models, Schema, type InferSchemaType } from "mongoose";

const taskSchema = new Schema(
  {
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
    assignedToId: {
      type: Schema.Types.ObjectId,
      refPath: "assigneeModel",
    },
    assigneeModel: {
      type: String,
      enum: ["Volunteer", "Team"],
      default: "Volunteer",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    dueDate: {
      type: Date,
    },
    relatedIncidentId: {
      type: Schema.Types.ObjectId,
      ref: "Incident",
    },
  },
  {
    timestamps: true,
  },
);

export type TaskDocument = InferSchemaType<typeof taskSchema>;

export const Task = models.Task || model("Task", taskSchema);
