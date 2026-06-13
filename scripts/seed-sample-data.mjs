import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

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

const mongoUri = loadMongoUri();

const eventSchema = new mongoose.Schema(
  {
    name: String,
    venue: String,
    city: String,
    startDate: Date,
    endDate: Date,
    description: String,
    status: String,
  },
  { timestamps: true },
);

const speakerSchema = new mongoose.Schema(
  {
    eventId: mongoose.Schema.Types.ObjectId,
    name: String,
    company: String,
    email: String,
    phone: String,
    arrivalStatus: String,
  },
  { timestamps: true },
);

const volunteerSchema = new mongoose.Schema(
  {
    eventId: mongoose.Schema.Types.ObjectId,
    fullName: String,
    email: String,
    phone: String,
    role: String,
    shift: String,
    status: String,
  },
  { timestamps: true },
);

const incidentSchema = new mongoose.Schema(
  {
    eventId: mongoose.Schema.Types.ObjectId,
    type: String,
    severity: String,
    description: String,
    status: String,
    reportedAt: Date,
  },
  { timestamps: true },
);

const taskSchema = new mongoose.Schema(
  {
    incidentId: mongoose.Schema.Types.ObjectId,
    eventId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    status: String,
    location: String,
    priority: String,
    assignedTo: String,
    assignedBy: String,
  },
  { timestamps: true },
);

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
const Speaker =
  mongoose.models.Speaker || mongoose.model("Speaker", speakerSchema);
const Volunteer =
  mongoose.models.Volunteer || mongoose.model("Volunteer", volunteerSchema);
const Incident =
  mongoose.models.Incident || mongoose.model("Incident", incidentSchema);
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect("mongodb://127.0.0.1:27017/helm-events");

  console.log("Clearing existing data...");
  await Promise.all([
    Event.deleteMany({}),
    Speaker.deleteMany({}),
    Volunteer.deleteMany({}),
    Incident.deleteMany({}),
    Task.deleteMany({}),
  ]);

  console.log("Seeding data...");

  const event = await Event.create({
    name: "Helm Event Operations Summit 2026",
    venue: "Bangalore International Exhibition Centre",
    city: "Bangalore",
    startDate: new Date("2026-07-18T08:00:00+05:30"),
    endDate: new Date("2026-07-18T19:00:00+05:30"),
    description:
      "One-day event operations summit covering speaker logistics, volunteer coordination, and live incident response.",
    status: "active",
  });

  const speakers = await Speaker.insertMany([
    {
      eventId: event._id,
      name: "Ananya Rao",
      company: "AzureVista Events",
      email: "ananya.rao@azurevista.in",
      phone: "+91 98765 11001",
      arrivalStatus: "checked-in",
    },
    {
      eventId: event._id,
      name: "Rahul Menon",
      company: "OpsForge Labs",
      email: "rahul.menon@opsforge.ai",
      phone: "+91 98765 11002",
      arrivalStatus: "en-route",
    },
    {
      eventId: event._id,
      name: "Meera Iyer",
      company: "SignalPeak Media",
      email: "meera.iyer@signalpeak.co",
      phone: "+91 98765 11003",
      arrivalStatus: "pending",
    },
  ]);

  const volunteers = await Volunteer.insertMany([
    {
      eventId: event._id,
      fullName: "Arjun Nair",
      email: "arjun.nair@example.com",
      role: "Registration Desk",
      phone: "+91 98800 22001",
      shift: "Morning (08:00 - 13:00)",
      status: "Active",
    },
    {
      eventId: event._id,
      fullName: "Priya Das",
      email: "priya.das@example.com",
      role: "Speaker Green Room",
      phone: "+91 98800 22002",
      shift: "Morning (08:00 - 13:00)",
      status: "Active",
    },
    {
      eventId: event._id,
      fullName: "Kiran Babu",
      email: "kiran.babu@example.com",
      role: "AV Support Runner",
      phone: "+91 98800 22003",
      shift: "Full Day (08:00 - 18:00)",
      status: "Active",
    },
    {
      eventId: event._id,
      fullName: "Shreya Kulkarni",
      email: "shreya.k@example.com",
      role: "Room Turnover",
      phone: "+91 98800 22004",
      shift: "Afternoon (13:00 - 18:00)",
      status: "Active",
    },
    {
      eventId: event._id,
      fullName: "Vikram Shah",
      email: "vikram.s@example.com",
      role: "VIP Escort",
      phone: "+91 98800 22005",
      shift: "Afternoon (13:00 - 18:00)",
      status: "Active",
    },
    {
      eventId: event._id,
      fullName: "Sarah Jenkins",
      email: "sarah.j@helmevents.com",
      role: "Volunteer Coordinator",
      phone: "+1 (555) 123-4567",
      shift: "Full Day (08:00 - 18:00)",
      status: "Active",
    },
    {
      eventId: event._id,
      fullName: "Michael Chen",
      email: "m.chen@helmevents.com",
      role: "Venue Lead",
      phone: "+1 (555) 234-5678",
      shift: "Full Day (08:00 - 18:00)",
      status: "Active",
    },
    {
      eventId: event._id,
      fullName: "Volunteer User",
      email: "volunteer@example.com",
      role: "General Support",
      phone: "+1 (555) 000-0000",
      shift: "Morning (08:00 - 13:00)",
      status: "Active",
    },
  ]);

  const incidents = await Incident.insertMany([
    {
      eventId: event._id,
      type: "AV",
      severity: "high",
      description:
        "Main stage confidence monitor stopped receiving feed during speaker rehearsal.",
      status: "investigating",
      reportedAt: new Date("2026-07-18T08:45:00+05:30"),
    },
    {
      eventId: event._id,
      type: "Transport",
      severity: "medium",
      description:
        "Speaker shuttle for Rahul Menon is delayed by traffic near Yeshwantpur.",
      status: "mitigated",
      reportedAt: new Date("2026-07-18T09:05:00+05:30"),
    },
    {
      eventId: event._id,
      type: "Crowd Flow",
      severity: "medium",
      description:
        "Registration queue exceeded stanchion area near the east entrance.",
      status: "open",
      reportedAt: new Date("2026-07-18T09:20:00+05:30"),
    },
  ]);

  const tasks = await Task.insertMany([
    {
      incidentId: incidents[0]._id,
      eventId: event._id,
      title: "Reconnect stage monitor feed",
      description:
        "Inspect HDMI splitter and restore confidence monitor signal before keynote.",
      status: "in-progress",
      location: "Main Stage",
      priority: "high",
      assignedTo: "Kiran Babu",
      assignedBy: "Operations Control",
    },
    {
      incidentId: incidents[0]._id,
      eventId: event._id,
      title: "Prepare backup display",
      description:
        "Move spare monitor from breakout room storage to main stage holding area.",
      status: "open",
      location: "Breakout Room Storage",
      priority: "medium",
      assignedTo: "Priya Das",
      assignedBy: "Operations Control",
    },
    {
      incidentId: incidents[1]._id,
      eventId: event._id,
      title: "Update session lead on ETA",
      description:
        "Inform programming desk and hold speaker intro by five minutes if needed.",
      status: "completed",
      location: "Programming Desk",
      priority: "medium",
      assignedTo: "Vikram Shah",
      assignedBy: "Operations Control",
    },
    {
      incidentId: incidents[2]._id,
      eventId: event._id,
      title: "Open overflow check-in point",
      description:
        "Redirect walk-in attendees to the secondary registration table near Hall B.",
      status: "in-progress",
      location: "Hall B",
      priority: "high",
      assignedTo: "Arjun Nair",
      assignedBy: "Operations Control",
    },
    {
      incidentId: incidents[2]._id,
      eventId: event._id,
      title: "Deploy crowd guidance volunteer",
      description:
        "Station one volunteer at the east entrance to guide attendees into two lines.",
      status: "open",
      location: "East Entrance",
      priority: "medium",
      assignedTo: "Shreya Kulkarni",
      assignedBy: "Operations Control",
    },
    {
      eventId: event._id,
      title: "Review safety protocols with all staff",
      description: "Brief staff on emergency exits and evacuation plans.",
      status: "open",
      location: "All Areas",
      priority: "high",
      assignedTo: "Michael Chen",
      assignedBy: "Operations Control",
    },
    {
      eventId: event._id,
      title: "Restock badge holders at Reg Desk A",
      description: "Registration Desk A is running low on badge holders. Please bring two boxes from the storage room.",
      status: "open",
      location: "Registration Desk A",
      priority: "high",
      assignedTo: "Volunteer User",
      assignedBy: "Sarah Jenkins",
    },
    {
      eventId: event._id,
      title: "Check VIP lounge water supply",
      description: "Ensure there are enough water bottles in the VIP lounge fridge.",
      status: "in-progress",
      location: "VIP Lounge",
      priority: "medium",
      assignedTo: "Volunteer User",
      assignedBy: "Sarah Jenkins",
    },
    {
      eventId: event._id,
      title: "Distribute lunch vouchers to volunteers",
      description: "Take the envelope of vouchers and distribute to volunteers at the information desks.",
      status: "open",
      location: "Information Desks",
      priority: "low",
      assignedTo: "Volunteer User",
      assignedBy: "Operations Control",
    },
  ]);

  console.log(
    JSON.stringify(
      {
        eventId: event._id,
        created: {
          events: 1,
          speakers: speakers.length,
          volunteers: volunteers.length,
          incidents: incidents.length,
          tasks: tasks.length,
        },
      },
      null,
      2,
    ),
  );
}

seed()
  .catch((error) => {
    console.error("Sample seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
