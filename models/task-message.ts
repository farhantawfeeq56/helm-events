import { model, models, Schema, type InferSchemaType } from "mongoose";

const taskMessageSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
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
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
    mentions: [
      {
        type: String,
      },
    ],
    readBy: [
      {
        userId: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export type TaskMessageDocument = InferSchemaType<typeof taskMessageSchema>;

export const TaskMessage = models.TaskMessage || model("TaskMessage", taskMessageSchema);
