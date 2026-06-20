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
import { Shift } from "@/models/shift";
import { Incident } from "@/models/incident";
import { IncidentMessage } from "@/models/incident-message";
import { Task } from "@/models/task";
import { MetricSnapshot } from "@/models/metric-snapshot";
import { computeEventMetrics } from "@/lib/services/metrics-service";
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
        Shift.deleteMany({}),
        Incident.deleteMany({}),
        IncidentMessage.deleteMany({}),
        Task.deleteMany({}),
        MetricSnapshot.deleteMany({}),
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
    const organizers = await Organizer.insertMany(organizersData);

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
    const volunteers = await Volunteer.insertMany(volunteersData);

    // 7b. Create real Shift records for each volunteer, anchored to the event day
    // and their roster slot — so the shift system is populated from live data.
    const SHIFT_WINDOWS: Record<string, { start: string; end: string }> = {
      Morning: { start: "08:00", end: "12:00" },
      Afternoon: { start: "12:00", end: "17:00" },
      "Full Day": { start: "08:00", end: "17:00" },
    };
    const ROLE_LOCATIONS: Record<string, string> = {
      "Registration Desk": "Main Lobby — Registration",
      "Room Monitor": "Breakout Rooms",
      "Information Booth": "Central Concourse",
      "Technical Support": "AV Control Room",
    };
    const eventDateISO = new Date(event.startDate).toISOString().slice(0, 10);
    const shiftsData = volunteers.map((v) => {
      const label = (v as { shift?: string }).shift || "Morning";
      const role = (v as { role?: string }).role || "General Support";
      const window = SHIFT_WINDOWS[label] || SHIFT_WINDOWS.Morning;
      return {
        eventId,
        title: `${role} — ${label}`,
        description: `${label} shift covering ${role.toLowerCase()} duties.`,
        location: ROLE_LOCATIONS[role] || "Event Floor",
        role,
        date: eventDateISO,
        startTime: window.start,
        endTime: window.end,
        assignedTo: (v as { fullName: string }).fullName,
        status: "scheduled",
      };
    });
    await Shift.insertMany(shiftsData);

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

    // 10. Create operational incidents (mix of resolved/active, manual/Hermes,
    // some acknowledged) so the incident workspace AND resolution analytics have
    // real history. Resolved incidents' reportedAt → now spread gives real MTTR.
    const now = Date.now();
    const volNames = volunteers.map((v) => (v as { fullName: string }).fullName);
    const incidentSeeds = [
      { type: "Crowd Flow", title: "Registration Queue Overcrowding", severity: "high", status: "resolved", source: "hermes", minsAgo: 65, acks: 2, description: "Long queues at the main entrance after a badge-scanner slowdown. Manual check-in started, then scanners restored." },
      { type: "AV", title: "Projector Flickering in Hall B", severity: "medium", status: "resolved", source: "hermes", minsAgo: 40, acks: 1, description: "Intermittent projector signal during the Hall B workshop. Backup unit deployed." },
      { type: "Security", title: "Unattended Bag — Concourse", severity: "high", status: "investigating", source: "manual", minsAgo: 8, acks: 1, description: "Unattended bag reported near the central concourse. Security sweep underway." },
      { type: "Facilities", title: "HVAC Warm in Room C", severity: "low", status: "resolved", source: "manual", minsAgo: 95, acks: 0, description: "Room C reported warm; portable cooling deployed and temperature normalized." },
      { type: "Crowd Flow", title: "Bottleneck at Hall A Doors", severity: "medium", status: "open", source: "hermes", minsAgo: 4, acks: 0, description: "Congestion building at Hall A entry between sessions." },
      { type: "Medical", title: "Attendee Fainted — Lobby", severity: "high", status: "resolved", source: "manual", minsAgo: 30, acks: 3, description: "Attendee fainted in the lobby; first aid administered, attendee recovered." },
      { type: "AV", title: "Mic Dropout — Main Stage", severity: "low", status: "mitigated", source: "hermes", minsAgo: 18, acks: 1, description: "Wireless mic dropouts on the main stage; switched to backup channel." },
    ];
    const incidentDocs = await Incident.insertMany(
      incidentSeeds.map((s, idx) => {
        const reportedAt = new Date(now - s.minsAgo * 60_000);
        return {
          eventId,
          type: s.type,
          title: s.title,
          severity: s.severity,
          description: s.description,
          status: s.status,
          source: s.source,
          reportedAt,
          acknowledgedBy: Array.from({ length: s.acks }).map((_, a) => ({
            name: volNames[(idx * 2 + a) % volNames.length] || "Volunteer",
            role: "volunteer",
            at: new Date(reportedAt.getTime() + (a + 1) * 4 * 60_000),
          })),
        };
      }),
    );

    // 10a. Create tasks across volunteers/incidents with a realistic status mix.
    // Completed tasks carry back-dated timestamps so execution-time analytics are
    // meaningful. Inserted via the native driver to control createdAt/updatedAt.
    const orgNames = organizers.map((o) => (o as { fullName: string }).fullName);
    const TASK_TITLES = [
      "Cordon off the affected zone", "Redirect attendee flow", "Deploy backup AV unit",
      "Escort medical team to location", "Restock registration supplies", "Verify exit routes",
      "Coordinate with venue security", "Update digital signage", "Sweep the concourse",
      "Confirm speaker readiness", "Reset the badge scanners", "Stage additional staff",
    ];
    // Force a slice of the seed set into ops states (blocked / escalated / overdue)
    // so the Task Operations board and attention feed always have live signal.
    const BLOCKER_REASONS = [
      "Vendor hasn't delivered the crowd barriers; can't close the perimeter.",
      "Waiting on venue security to unlock the loading dock.",
      "Backup AV unit is missing its power cable — sourcing a replacement.",
    ];
    const tasksRaw = Array.from({ length: 26 }).map((_, i) => {
      const r = Math.random();
      let status = r < 0.5 ? "completed" : r < 0.75 ? "in-progress" : "open";
      const createdMinsAgo = 30 + Math.floor(Math.random() * 180);
      const createdAt = new Date(now - createdMinsAgo * 60_000);
      const execMins = 10 + Math.floor(Math.random() * 80);
      let priority = getRandomItem(["low", "medium", "high"]);
      let blockedReason = "";
      let escalationLevel = 0;
      let dueAt: Date | undefined;

      if (i < 2) {
        // Blocked work, organizer notified, deadline already slipped.
        status = "blocked";
        blockedReason = BLOCKER_REASONS[i % BLOCKER_REASONS.length];
        dueAt = new Date(now - (20 + i * 15) * 60_000);
      } else if (i < 4) {
        // Escalated, high-priority, overdue.
        status = "escalated";
        priority = "high";
        escalationLevel = i === 2 ? 1 : 2;
        dueAt = new Date(now - (35 + i * 10) * 60_000);
      } else if (i < 8 && status !== "completed") {
        // Plain overdue: active task whose deadline has passed.
        dueAt = new Date(now - (10 + i * 7) * 60_000);
      } else if (status !== "completed") {
        // Healthy active work with an upcoming deadline.
        dueAt = new Date(now + (20 + Math.floor(Math.random() * 120)) * 60_000);
      }

      const updatedAt = status === "completed" ? new Date(createdAt.getTime() + execMins * 60_000) : createdAt;
      const inc = incidentDocs[i % incidentDocs.length] as { _id: unknown };
      return {
        _id: new mongoose.Types.ObjectId(),
        eventId: event._id,
        incidentId: i % 3 === 0 ? inc._id : undefined,
        title: TASK_TITLES[i % TASK_TITLES.length],
        description: "",
        status,
        priority,
        location: "",
        objective: "",
        expectedOutcome: "",
        assignedTo: volNames[i % volNames.length] || "",
        assignedBy: orgNames[i % orgNames.length] || "Operations",
        assignmentReason: "",
        dueAt,
        blockedReason,
        escalationLevel,
        createdAt,
        updatedAt,
        __v: 0,
      };
    });
    await mongoose.connection.db!.collection("tasks").insertMany(tasksRaw);

    // 10b. A few coordination messages from volunteers on active incidents.
    const activeIncidents = incidentDocs.filter((i) => ["open", "investigating", "mitigated"].includes((i as { status: string }).status));
    await IncidentMessage.insertMany(
      activeIncidents.slice(0, 3).flatMap((inc, idx) => [
        { incidentId: (inc as { _id: unknown })._id, sender: { id: "v", name: volNames[idx] || "Volunteer", role: "volunteer" }, content: "On scene, assessing now." },
        { incidentId: (inc as { _id: unknown })._id, sender: { id: "v2", name: volNames[idx + 3] || "Volunteer", role: "volunteer" }, content: "Need one more hand here." },
      ]),
    );

    // 11. Seed historical metric snapshots so performance trends render from the
    // start. The latest point equals the real current metrics; earlier points
    // taper to a plausible "operation warming up" trajectory. Real snapshots
    // accrue from live activity thereafter.
    const current = await computeEventMetrics(eventId);
    const points = 12;
    const snapshots = Array.from({ length: points }).map((_, i) => {
      const f = i / (points - 1); // 0 (oldest) → 1 (now)
      const lerp = (start: number, end: number) => Math.round(start + (end - start) * f);
      return {
        eventId,
        capturedAt: new Date(now - (points - 1 - i) * 60 * 60 * 1000),
        source: "auto" as const,
        trigger: "seed",
        metrics: {
          ...current,
          incidentsActive: lerp(current.incidentsActive + 3, current.incidentsActive),
          incidentsOpen: lerp(current.incidentsOpen + 2, current.incidentsOpen),
          incidentResolutionRate: lerp(Math.max(0, current.incidentResolutionRate - 25), current.incidentResolutionRate),
          taskCompletionRate: lerp(Math.max(0, current.taskCompletionRate - 30), current.taskCompletionRate),
          operationalReadiness: lerp(Math.max(0, current.operationalReadiness - 22), current.operationalReadiness),
          actionsLastHour: Math.max(0, Math.round(3 + Math.sin(i) * 2)),
        },
      };
    });
    await MetricSnapshot.insertMany(snapshots);

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
