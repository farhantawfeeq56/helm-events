import fs from "node:fs";
import path from "node:path";

import mongoose, { Schema, type Types } from "mongoose";

type Role = "admin" | "organizer" | "volunteer";

type VolunteerRecord = {
  _id: Types.ObjectId;
  name: string;
  role?: string;
};

type OrganizerRecord = {
  _id: Types.ObjectId;
  name?: string;
  team?: string;
};

type SeedUser = {
  email: string;
  linkedOrganizerId?: Types.ObjectId | null;
  linkedVolunteerId?: Types.ObjectId | null;
  name: string;
  role: Role;
  team: string;
};

function loadMongoUri() {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error("Missing MONGODB_URI. Set it in the environment or .env.local.");
  }

  const envFile = fs.readFileSync(envPath, "utf8");
  const line = envFile
    .split(/\r?\n/)
    .find((entry) => entry.startsWith("MONGODB_URI="));

  if (!line) {
    throw new Error("MONGODB_URI not found in .env.local.");
  }

  return line.slice("MONGODB_URI=".length).trim();
}

const userSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "organizer", "volunteer"],
    },
    team: String,
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
  { timestamps: true },
);

const volunteerSchema = new Schema(
  {
    name: String,
    role: String,
  },
  { strict: false },
);

const organizerSchema = new Schema(
  {
    name: String,
    team: String,
  },
  { strict: false },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Volunteer =
  mongoose.models.Volunteer || mongoose.model("Volunteer", volunteerSchema);
const Organizer =
  mongoose.models.Organizer || mongoose.model("Organizer", organizerSchema);

function buildVolunteerUsers(volunteers: VolunteerRecord[]): SeedUser[] {
  const fallbackUsers: Omit<SeedUser, "linkedVolunteerId">[] = [
    {
      name: "Nisha Verma",
      email: "nisha.verma@helm.events",
      role: "volunteer",
      team: "Registration",
    },
    {
      name: "Rohan Kapoor",
      email: "rohan.kapoor@helm.events",
      role: "volunteer",
      team: "Speaker Ops",
    },
    {
      name: "Sneha Pillai",
      email: "sneha.pillai@helm.events",
      role: "volunteer",
      team: "AV Support",
    },
    {
      name: "Aditya Joshi",
      email: "aditya.joshi@helm.events",
      role: "volunteer",
      team: "Room Operations",
    },
    {
      name: "Pooja Menon",
      email: "pooja.menon@helm.events",
      role: "volunteer",
      team: "VIP Assistance",
    },
    {
      name: "Harish Nair",
      email: "harish.nair@helm.events",
      role: "volunteer",
      team: "Logistics",
    },
    {
      name: "Ishita Rao",
      email: "ishita.rao@helm.events",
      role: "volunteer",
      team: "Audience Support",
    },
    {
      name: "Karthik Iyer",
      email: "karthik.iyer@helm.events",
      role: "volunteer",
      team: "Backstage",
    },
    {
      name: "Divya Shah",
      email: "divya.shah@helm.events",
      role: "volunteer",
      team: "Hospitality",
    },
    {
      name: "Manav Bedi",
      email: "manav.bedi@helm.events",
      role: "volunteer",
      team: "Wayfinding",
    },
  ];

  return fallbackUsers.map((user, index) => {
    const linkedVolunteer = volunteers[index];

    return {
      ...user,
      name: linkedVolunteer?.name || user.name,
      team: linkedVolunteer?.role || user.team,
      linkedVolunteerId: linkedVolunteer?._id ?? null,
    };
  });
}

function buildOrganizerUsers(organizers: OrganizerRecord[]): SeedUser[] {
  const baseUsers: Omit<SeedUser, "linkedOrganizerId" | "linkedVolunteerId">[] = [
    {
      name: "Aarav Malhotra",
      email: "aarav.malhotra@helm.events",
      role: "organizer",
      team: "Programming",
    },
    {
      name: "Megha Srinivasan",
      email: "megha.srinivasan@helm.events",
      role: "organizer",
      team: "Operations",
    },
    {
      name: "Farhan Ali",
      email: "farhan.ali@helm.events",
      role: "organizer",
      team: "Partnerships",
    },
  ];

  return baseUsers.map((user, index) => {
    const linkedOrganizer = organizers[index];

    return {
      ...user,
      name: linkedOrganizer?.name || user.name,
      team: linkedOrganizer?.team || user.team,
      linkedOrganizerId: linkedOrganizer?._id ?? null,
      linkedVolunteerId: null,
    };
  });
}

async function seedUsers() {
  await mongoose.connect(loadMongoUri(), {
    bufferCommands: false,
  });

  const volunteers = (await Volunteer.find({}, { _id: 1, name: 1, role: 1 })
    .sort({ createdAt: 1 })
    .limit(10)
    .lean()) as VolunteerRecord[];

  const organizers = (await Organizer.find({}, { _id: 1, name: 1, team: 1 })
    .sort({ createdAt: 1 })
    .limit(3)
    .lean()) as OrganizerRecord[];

  const users: SeedUser[] = [
    ...buildVolunteerUsers(volunteers),
    ...buildOrganizerUsers(organizers),
    {
      name: "Lakshan Adhithyaa",
      email: "lakshan.adhithyaa@helm.events",
      role: "admin",
      team: "Platform Admin",
      linkedVolunteerId: null,
      linkedOrganizerId: null,
    },
  ];

  for (const user of users) {
    await User.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          name: user.name,
          role: user.role,
          team: user.team,
          linkedVolunteerId: user.linkedVolunteerId ?? null,
          linkedOrganizerId: user.linkedOrganizerId ?? null,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  console.log(
    JSON.stringify(
      {
        created: {
          admins: 1,
          organizers: 3,
          volunteers: 10,
        },
        linked: {
          organizers: organizers.length,
          volunteers: volunteers.length,
        },
      },
      null,
      2,
    ),
  );
}

seedUsers()
  .catch((error) => {
    console.error("User seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
