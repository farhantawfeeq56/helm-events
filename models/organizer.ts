import { model, models, Schema, type InferSchemaType } from "mongoose";

const organizerSchema = new Schema(
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
    phone: {
      type: String,
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export type OrganizerDocument = InferSchemaType<typeof organizerSchema>;

export const Organizer = models.Organizer || model("Organizer", organizerSchema);
