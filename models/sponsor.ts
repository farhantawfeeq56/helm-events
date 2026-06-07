import { model, models, Schema, type InferSchemaType } from "mongoose";

const sponsorSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ["Platinum", "Gold", "Silver", "Bronze"],
      default: "Silver",
    },
    contact: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Pending"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export type SponsorDocument = InferSchemaType<typeof sponsorSchema>;

export const Sponsor = models.Sponsor || model("Sponsor", sponsorSchema);
