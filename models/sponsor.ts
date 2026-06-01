import { model, models, Schema, type InferSchemaType } from "mongoose";

const sponsorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ["title", "gold", "silver", "community", "partner"],
      default: "community",
    },
    contactName: {
      type: String,
      trim: true,
      default: "",
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    activationNotes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["prospect", "confirmed", "invoiced"],
      default: "prospect",
    },
  },
  {
    timestamps: true,
  },
);

export type SponsorDocument = InferSchemaType<typeof sponsorSchema>;

export const Sponsor = models.Sponsor || model("Sponsor", sponsorSchema);
