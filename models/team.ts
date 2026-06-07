import { model, models, Schema, type InferSchemaType } from "mongoose";

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    leadId: {
      type: Schema.Types.ObjectId,
      refPath: "leadModel",
    },
    leadModel: {
      type: String,
      enum: ["Volunteer", "Organizer"],
      default: "Volunteer",
    },
    memberIds: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Volunteer",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export type TeamDocument = InferSchemaType<typeof teamSchema>;

export const Team = models.Team || model("Team", teamSchema);
