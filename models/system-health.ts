import { model, models, Schema, type InferSchemaType } from "mongoose";

const systemHealthSchema = new Schema(
  {
    service: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Operational", "Degraded", "Down"],
      default: "Operational",
    },
    uptime: {
      type: String,
      required: true,
    },
    lastChecked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export type SystemHealthDocument = InferSchemaType<typeof systemHealthSchema>;

export const SystemHealth =
  models.SystemHealth || model("SystemHealth", systemHealthSchema);
