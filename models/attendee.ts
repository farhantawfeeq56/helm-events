import mongoose, { Schema, Document } from "mongoose";

export interface AttendeeDocument extends Document {
  fullName: string;
  email: string;
  organization: string;
  ticketType: "VIP" | "General" | "Student";
  status: "Registered" | "Checked-in" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const attendeeSchema = new Schema<AttendeeDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    organization: { type: String, required: true },
    ticketType: {
      type: String,
      enum: ["VIP", "General", "Student"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["Registered", "Checked-in", "Cancelled"],
      default: "Registered",
    },
  },
  { timestamps: true }
);

export const Attendee =
  mongoose.models.Attendee ||
  mongoose.model<AttendeeDocument>("Attendee", attendeeSchema);
