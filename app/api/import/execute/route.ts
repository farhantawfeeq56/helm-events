import { NextResponse } from "next/server";
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

const MODELS: Record<string, any> = {
  events: Event,
  speakers: Speaker,
  sponsors: Sponsor,
  sessions: Session,
  rooms: Room,
  volunteers: Volunteer,
  attendees: Attendee,
  organizers: Organizer,
  facilities: Facility,
};

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { collection, data } = await request.json();

    if (!collection || !data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const Model = MODELS[collection];
    if (!Model) {
      return NextResponse.json(
        { success: false, error: "Collection not found" },
        { status: 404 }
      );
    }

    // High-performance bulk insertion
    const result = await Model.insertMany(data, { ordered: false });

    return NextResponse.json({ 
      success: true, 
      count: result.length,
      message: `Successfully imported ${result.length} items.`
    });
  } catch (error: any) {
    // Handle partial failures if ordered: false
    if (error.name === 'BulkWriteError' || error.name === 'MongoBulkWriteError') {
      return NextResponse.json({
        success: true,
        count: error.result?.nInserted || 0,
        errorCount: error.writeErrors?.length || 0,
        message: `Imported with some errors. Success: ${error.result?.nInserted || 0}, Failures: ${error.writeErrors?.length || 0}`,
        errors: error.writeErrors?.slice(0, 10).map((e: any) => e.errmsg)
      });
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute bulk import" },
      { status: 500 }
    );
  }
}
