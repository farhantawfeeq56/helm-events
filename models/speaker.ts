import { model, models, Schema, type InferSchemaType } from "mongoose";

const speakerSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
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
    status: {
      type: String,
      enum: ["Confirmed", "Pending", "Withdrawn"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export type SpeakerDocument = InferSchemaType<typeof speakerSchema>;

export const Speaker = models.Speaker || model("Speaker", speakerSchema);
