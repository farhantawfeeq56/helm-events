import { model, models, Schema, type InferSchemaType } from "mongoose";

const volunteerSchema = new Schema(
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
      enum: ["Active", "Pending", "Inactive"],
      default: "Pending",
    },
    // Login credential. Defaults to the shared demo password for every new
    // profile. `select: false` keeps it out of normal API responses.
    password: {
      type: String,
      default: "Test@123",
      select: false,
    },
  },
  {
    timestamps: true,
    // Never serialize the password, even on the create() response document
    // (select:false only hides it from queries, not from a freshly created doc).
    toJSON: { transform: (_doc, ret) => { delete (ret as { password?: string }).password; return ret; } },
    toObject: { transform: (_doc, ret) => { delete (ret as { password?: string }).password; return ret; } },
  },
);

export type VolunteerDocument = InferSchemaType<typeof volunteerSchema>;

export const Volunteer = models.Volunteer || model("Volunteer", volunteerSchema);
