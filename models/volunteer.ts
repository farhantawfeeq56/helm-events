import { model, models, Schema, type InferSchemaType } from "mongoose";

const volunteerSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
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
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    shift: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["invited", "confirmed", "checked-in"],
      default: "invited",
    },
  },
  {
    timestamps: true,
  },
);

export type VolunteerDocument = InferSchemaType<typeof volunteerSchema>;

export const Volunteer = models.Volunteer || model("Volunteer", volunteerSchema);
