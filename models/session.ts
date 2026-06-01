import { model, models, Schema, type InferSchemaType } from "mongoose";

const sessionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    abstract: {
      type: String,
      trim: true,
      default: "",
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    speakerIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Speaker",
        },
      ],
      default: [],
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    track: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "confirmed", "live", "completed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);

export type SessionDocument = InferSchemaType<typeof sessionSchema>;

export const Session = models.Session || model("Session", sessionSchema);
