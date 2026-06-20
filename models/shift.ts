import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * A scheduled work block on an event. Organizers create/manage shifts and assign
 * a volunteer to each; volunteers see the shifts assigned to them. The live
 * display state (upcoming / in-progress / completed) is derived from the
 * date+time window in `lib/shifts.ts` — `status` is the organizer-managed
 * override used for cancellation or early completion.
 */
const shiftSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    // Operational function this shift covers (e.g. "Registration", "Security").
    // Aligns with volunteer roles so staffing intent is clear.
    role: {
      type: String,
      trim: true,
      default: "",
    },
    // Calendar day, "YYYY-MM-DD". Defaults handled at the UI/derivation layer.
    date: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v: string) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
        message: "Date must be in YYYY-MM-DD format.",
      },
    },
    startTime: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v: string) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
        message: "Start time must be in HH:MM (24-hour) format.",
      },
    },
    endTime: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v: string) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
        message: "End time must be in HH:MM (24-hour) format.",
      },
    },
    // Volunteer fullName assigned to this shift (mirrors Task.assignedTo so the
    // shared `?assignedTo=` filter and volunteer views work uniformly).
    assignedTo: {
      type: String,
      trim: true,
      default: "",
    },
    // Organizer-managed lifecycle override. Live timeline state is otherwise
    // derived from the time window.
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  },
);

export type ShiftDocument = InferSchemaType<typeof shiftSchema>;

export const Shift: Model<ShiftDocument> = models.Shift || model<ShiftDocument>("Shift", shiftSchema);
