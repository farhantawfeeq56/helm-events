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

const taskSchema = new mongoose.Schema(
  {
    incidentId: mongoose.Schema.Types.ObjectId,
    eventId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    status: String,
    assignedTo: String,
    assignedBy: String,
    priority: String,
  },
  { timestamps: true },
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

const eventSchema = new mongoose.Schema({ name: String });
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

async function seed() {
  await mongoose.connect(mongoUri, { bufferCommands: false });

  let event = await Event.findOne();
  if (!event) {
    event = await Event.create({ name: "Default Event" });
  }

  const volunteerName = "Volunteer User";
  
  await Task.deleteMany({ assignedTo: volunteerName });

  const tasks = await Task.insertMany([
    {
      eventId: event._id,
      title: "Restock badge holders at Reg Desk A",
      description: "Registration Desk A is running low on badge holders. Please bring two boxes from the storage room.",
      status: "open",
      assignedTo: volunteerName,
      assignedBy: "Sarah Jenkins",
      priority: "high",
    },
    {
      eventId: event._id,
      title: "Check VIP lounge water supply",
      description: "Ensure there are enough water bottles in the VIP lounge fridge.",
      status: "in-progress",
      assignedTo: volunteerName,
      assignedBy: "Sarah Jenkins",
      priority: "medium",
    },
    {
      eventId: event._id,
      title: "Distribute lunch vouchers to volunteers",
      description: "Take the envelope of vouchers and distribute to volunteers at the information desks.",
      status: "open",
      assignedTo: volunteerName,
      assignedBy: "Operations Control",
      priority: "low",
    },
    {
      eventId: event._id,
      title: "Verify session monitor presence in Ballroom B",
      description: "Walk by Ballroom B and confirm that the assigned session monitor is at their post.",
      status: "completed",
      assignedTo: volunteerName,
      assignedBy: "Sarah Jenkins",
      priority: "medium",
    },
  ]);

  console.log(`Seed completed. Created ${tasks.length} tasks for ${volunteerName}.`);
}

seed()
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
