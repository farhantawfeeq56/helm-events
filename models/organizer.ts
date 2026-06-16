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

export type OrganizerDocument = InferSchemaType<typeof organizerSchema>;

export const Organizer = models.Organizer || model("Organizer", organizerSchema);
