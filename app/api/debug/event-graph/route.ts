import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { Session } from "@/models/session";
import { Speaker } from "@/models/speaker";
import { Room } from "@/models/room";
import { Attendee } from "@/models/attendee";
import { Sponsor } from "@/models/sponsor";
import { Volunteer } from "@/models/volunteer";
import { Facility } from "@/models/facility";
import { Organizer } from "@/models/organizer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    
    const events = await Event.find().lean();
    const eventGraph = [];

    for (const event of events) {
      const eventId = event._id;
      const [
        sessions,
        speakers,
        rooms,
        attendees,
        sponsors,
        volunteers,
        facilities,
        organizers
      ] = await Promise.all([
        Session.countDocuments({ eventId }),
        Speaker.countDocuments({ eventId }),
        Room.countDocuments({ eventId }),
        Attendee.countDocuments({ eventId }),
        Sponsor.countDocuments({ eventId }),
        Volunteer.countDocuments({ eventId }),
        Facility.countDocuments({ eventId }),
        Organizer.countDocuments({ eventId }),
      ]);

      eventGraph.push({
        event: {
          id: eventId,
          name: event.name,
          status: event.status,
        },
        relationships: {
          sessions,
          speakers,
          rooms,
          attendees,
          sponsors,
          volunteers,
          facilities,
          organizers,
        }
      });
    }

    // Check for orphan records (no eventId)
    const orphanQuery = { $or: [{ eventId: { $exists: false } }, { eventId: null }] };
    
    const orphans = {
      sessions: await Session.countDocuments(orphanQuery),
      speakers: await Speaker.countDocuments(orphanQuery),
      rooms: await Room.countDocuments(orphanQuery),
      attendees: await Attendee.countDocuments(orphanQuery),
      sponsors: await Sponsor.countDocuments(orphanQuery),
      volunteers: await Volunteer.countDocuments(orphanQuery),
      facilities: await Facility.countDocuments(orphanQuery),
      organizers: await Organizer.countDocuments(orphanQuery),
    };

    return NextResponse.json({ 
      success: true, 
      data: {
        totalEvents: events.length,
        eventGraph,
        orphans,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
