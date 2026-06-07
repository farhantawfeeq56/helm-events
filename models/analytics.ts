import { model, models, Schema, type InferSchemaType } from "mongoose";

const analyticsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    change: {
      type: String,
      required: true,
    },
    trend: {
      type: String,
      enum: ["up", "down", "neutral"],
      default: "neutral",
    },
  },
  {
    timestamps: true,
  },
);

export type AnalyticsDocument = InferSchemaType<typeof analyticsSchema>;

export const Analytics = models.Analytics || model("Analytics", analyticsSchema);
