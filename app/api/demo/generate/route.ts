import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { Speaker } from "@/models/speaker";
import { Sponsor } from "@/models/sponsor";
import { Session } from "@/models/session";
import { Room } from "@/models/room";
import { Volunteer } from "@/models/volunteer";
import { Attendee } from "@/models/attendee";
import { Organizer } from "@/models/organizer";
import { Facility } from "@/models/facility";
import { logActivity } from "@/lib/activity-logger";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const SURNAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];
const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Lisa", "Daniel", "Nancy", "Matthew", "Betty", "Anthony", "Sandra", "Mark", "Margaret", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah"];
const COMPANIES = ["TechNova Solutions", "GreenLeaf Dynamics", "Skyline Interactive", "Oceanic Enterprises", "Polaris Systems", "Zenith Consulting", "Apex Industries", "Quantum Research", "Velocity Labs", "Nexus Networks", "Cortex Media", "Elemental Ventures", "Stellar Soft", "Vanguard Global", "Infinity Labs"];
const TOPICS = ["Artificial Intelligence in Healthcare", "Sustainable Energy Solutions", "The Future of Remote Work", "Blockchain for Supply Chain", "Cybersecurity in the Age of IoT", "Quantum Computing Fundamentals", "User Experience Design for AR/VR", "Digital Transformation Strategies", "Cloud Native Architectures", "The Ethics of Gene Editing"];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomName() {
  return `${getRandomItem(FIRST_NAMES)} ${getRandomItem(SURNAMES)}`;
}

function getUniqueEmail(name: string, suffix: string) {
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${name.toLowerCase().replace(/\s+/g, ".")}.${randomStr}@${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { size = "small", clearPrevious = false } = await req.json();

    if (clearPrevious) {
      await Promise.all([
        Event.deleteMany({}),
        Speaker.deleteMany({}),
        Sponsor.deleteMany({}),
        Session.deleteMany({}),
        Room.deleteMany({}),
        Volunteer.deleteMany({}),
        Attendee.deleteMany({}),
        Organizer.deleteMany({}),
        Facility.deleteMany({}),
      ]);
    }

    const attendeeCount = size === "large" ? 5000 : size === "medium" ? 500 : 100;

    // 1. Create Event
    const event = await Event.create({
      name: `Global Tech Summit 2025 - ${size.charAt(0).toUpperCase() + size.slice(1)} Edition`,
      description: "A comprehensive gathering of technology leaders, innovators, and enthusiasts from around the world to discuss the future of digital ecosystems.",
      venue: "Convention Center Delta",
      city: "San Francisco",
      timezone: "America/Los_Angeles",
      startDate: new Date("2025-09-15T09:00:00Z"),
      endDate: new Date("2025-09-17T18:00:00Z"),
      status: "confirmed",
    });

    const eventId = event._id;

    // 2. Create Organizers
    const organizersData = Array.from({ length: 5 }).map(() => {
      const fullName = getRandomName();
      return {
        fullName,
        eventId,
        email: getUniqueEmail(fullName, "example.com"),
        phone: `555-010${Math.floor(Math.random() * 9)}`,
        organization: "Global Tech Events LLC",
        role: getRandomItem(["Lead Coordinator", "Logistics Manager", "Speaker Liaison", "Sponsorship Director", "Attendee Experience"]),
      };
    });
    await Organizer.insertMany(organizersData);

    // 3. Create Facilities
    const facilities = await Facility.insertMany([
      {
        name: "Main Convention Hall",
        eventId,
        type: "Venue",
        address: "123 Event St, San Francisco, CA",
        capacity: 6000,
        contactName: "John Manager",
        contactEmail: "john@conventioncenter.com",
      },
      {
        name: "Grand Hotel & Suites",
        eventId,
        type: "Hotel",
        address: "456 Hospitality Ave, San Francisco, CA",
        capacity: 1000,
        contactName: "Sarah Guest",
        contactEmail: "sarah@grandhotel.com",
      }
    ]);

    // 4. Create Rooms
    const roomNames = ["Alpha Hall", "Beta Ballroom", "Gamma Room", "Delta Suite", "Epsilon Lounge", "Zeta Lab", "Eta Workshop"];
    const rooms = await Room.insertMany(roomNames.map(name => ({
      eventId,
      name,
      capacity: Math.floor(Math.random() * 200) + 50,
      location: "Level " + (Math.floor(Math.random() * 3) + 1),
      setupStyle: getRandomItem(["Theater", "Classroom", "Workshop", "U-Shape"]),
      avNotes: "Standard projector and sound system.",
    })));

    // 5. Create Sponsors
    const sponsorTiers: ("Platinum" | "Gold" | "Silver" | "Bronze")[] = ["Platinum", "Gold", "Silver", "Bronze"];
    await Sponsor.insertMany(Array.from({ length: 12 }).map(() => {
      const company = getRandomItem(COMPANIES) + " " + Math.floor(Math.random() * 100);
      return {
        companyName: company,
        eventId,
        tier: getRandomItem(sponsorTiers),
        contact: getRandomName(),
        email: getUniqueEmail(company.replace(/ /g, ""), "sponsor.com"),
        status: "Active",
      };
    }));

    // 6. Create Speakers
    const speakersData = Array.from({ length: 25 }).map(() => {
      const fullName = getRandomName();
      return {
        fullName,
        eventId,
        email: getUniqueEmail(fullName, "speaker.com"),
        company: getRandomItem(COMPANIES),
        title: getRandomItem(["CTO", "Lead Architect", "Principal Engineer", "Director of Product", "Senior Researcher"]),
        bio: "An industry expert with over 15 years of experience in their field.",
        topic: getRandomItem(TOPICS),
        status: "Confirmed",
      };
    });
    const speakers = await Speaker.insertMany(speakersData);

    // 7. Create Volunteers
    const volunteersData = Array.from({ length: 30 }).map(() => {
      const fullName = getRandomName();
      return {
        fullName,
        eventId,
        email: getUniqueEmail(fullName, "volunteer.com"),
        phone: `555-020${Math.floor(Math.random() * 9)}`,
        shift: getRandomItem(["Morning", "Afternoon", "Full Day"]),
        role: getRandomItem(["Registration Desk", "Room Monitor", "Information Booth", "Technical Support"]),
        status: "Active",
      };
    });
    await Volunteer.insertMany(volunteersData);

    // 8. Create Attendees
    // For large sizes, we should use a more efficient way to insert if possible, 
    // but 5000 is manageable with insertMany in one go or small chunks.
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < attendeeCount; i += CHUNK_SIZE) {
      const end = Math.min(i + CHUNK_SIZE, attendeeCount);
      const chunk = Array.from({ length: end - i }).map((_, j) => {
        const fullName = getRandomName();
        return {
          fullName,
          eventId,
          email: getUniqueEmail(fullName, "attendee.com"),
          organization: getRandomItem(COMPANIES),
          ticketType: getRandomItem(["VIP", "General", "Student"]),
          status: "Registered",
        };
      });
      await Attendee.insertMany(chunk);
    }

    // 9. Create Sessions
    const sessionsData = Array.from({ length: 20 }).map((_, i) => {
      const startTime = new Date(event.startDate);
      startTime.setHours(9 + (i % 8));
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      // Randomly assign 1-2 speakers
      const sessionSpeakers = [];
      const speakerCount = Math.random() > 0.8 ? 2 : 1;
      for (let s = 0; s < speakerCount; s++) {
        sessionSpeakers.push(getRandomItem(speakers)._id);
      }

      return {
        title: `Session ${i + 1}: ${getRandomItem(TOPICS)}`,
        abstract: "A detailed exploration of the subject matter, including case studies and future projections.",
        eventId,
        speakerIds: sessionSpeakers,
        roomId: getRandomItem(rooms)._id,
        startTime,
        endTime,
        track: getRandomItem(["Technical", "Leadership", "Innovation", "Ethics"]),
        status: "confirmed",
      };
    });
    await Session.insertMany(sessionsData);

    await logActivity({
      user: "System",
      type: "agent",
      action: "generate_demo_data",
      target: "system",
      details: `Generated ${size} demo event: ${event.name}`,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${size} event data.`,
      eventId: event._id,
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
