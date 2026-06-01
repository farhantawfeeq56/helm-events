import { model, models, Schema, type InferSchemaType } from "mongoose";

const roomSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    setupStyle: {
      type: String,
      trim: true,
      default: "",
    },
    avNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export type RoomDocument = InferSchemaType<typeof roomSchema>;

export const Room = models.Room || model("Room", roomSchema);
