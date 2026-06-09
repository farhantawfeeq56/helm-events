import { model, models, Schema, type InferSchemaType } from "mongoose";

const activitySchema = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["human", "agent"],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export type ActivityDocument = InferSchemaType<typeof activitySchema>;

export const Activity = models.Activity || model("Activity", activitySchema);
