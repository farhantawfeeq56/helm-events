import { model, models, Schema, type InferSchemaType } from "mongoose";

const speakerSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    company: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    availabilityStatus: {
      type: String,
      enum: ["pending", "confirmed", "unavailable"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export type SpeakerDocument = InferSchemaType<typeof speakerSchema>;

export const Speaker = models.Speaker || model("Speaker", speakerSchema);
