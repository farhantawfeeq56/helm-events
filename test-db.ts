import { connectToDatabase } from "./lib/db";
import { Event } from "./models/event";
import { Speaker } from "./models/speaker";
import { Attendee } from "./models/attendee";
import * as dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();
    console.log("Connected successfully!");

    console.log("Testing Event.findOne()...");
    const event = await Event.findOne();
    console.log("Event:", event ? event.name : "None found");

    console.log("Testing Speaker.find()...");
    const speakers = await Speaker.find().limit(5);
    console.log("Speakers count:", speakers.length);

    console.log("Testing Attendee.find()...");
    const attendees = await Attendee.find().limit(5);
    console.log("Attendees count:", attendees.length);

    process.exit(0);
  } catch (error) {
    console.error("Connection test failed:", error);
    process.exit(1);
  }
}

testConnection();
