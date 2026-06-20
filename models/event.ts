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
      enum: {
        values: ["planning", "confirmed", "live", "completed", "cancelled"],
        message: "Status must be one of: planning, confirmed, live, completed, cancelled.",
      },
      default: "planning",
    },
  },
  {
    timestamps: true,
  },
);

// An event can't end before it starts.
eventSchema.pre("validate", function (next) {
  const doc = this as unknown as { startDate?: Date; endDate?: Date };
  if (doc.startDate && doc.endDate && new Date(doc.endDate).getTime() < new Date(doc.startDate).getTime()) {
    this.invalidate("endDate", "End date cannot be before the start date.");
  }
  next();
});

export type EventDocument = InferSchemaType<typeof eventSchema>;

export const Event = models.Event || model("Event", eventSchema);
