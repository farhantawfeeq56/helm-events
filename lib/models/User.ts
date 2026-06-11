import { model, models, Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "organizer", "volunteer"],
    },
    team: {
      type: String,
      trim: true,
      default: "",
    },
    linkedVolunteerId: {
      type: Schema.Types.ObjectId,
      ref: "Volunteer",
      default: null,
    },
    linkedOrganizerId: {
      type: Schema.Types.ObjectId,
      ref: "Organizer",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User = models.User || model("User", userSchema);
