import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "task_assigned",
        "task_updated",
        "task_escalated",
        "task_completed",
        "incident_assigned",
        "system_alert",
        "general",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    sourceId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;

export const Notification: Model<NotificationDocument> =
  models.Notification || model<NotificationDocument>("Notification", notificationSchema);
