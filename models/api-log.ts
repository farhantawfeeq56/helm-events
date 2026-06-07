import { model, models, Schema, type InferSchemaType } from "mongoose";

const apiLogSchema = new Schema(
  {
    method: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    duration: {
      type: String,
      required: true,
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

export type APILogDocument = InferSchemaType<typeof apiLogSchema>;

export const APILog = models.APILog || model("APILog", apiLogSchema);
