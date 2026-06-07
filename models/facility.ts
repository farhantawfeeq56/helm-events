import { model, models, Schema, type InferSchemaType } from "mongoose";

const facilitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

export type FacilityDocument = InferSchemaType<typeof facilitySchema>;

export const Facility = models.Facility || model("Facility", facilitySchema);
