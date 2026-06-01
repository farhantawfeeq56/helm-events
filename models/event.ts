import { model, models, Schema, type InferSchemaType } from "mongoose";

const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    timezone: {
      type: String,
      required: true,
      trim: true,
      default: "UTC",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["planning", "confirmed", "live", "completed"],
      default: "planning",
    },
  },
  {
    timestamps: true,
  },
);

export type EventDocument = InferSchemaType<typeof eventSchema>;

export const Event = models.Event || model("Event", eventSchema);
