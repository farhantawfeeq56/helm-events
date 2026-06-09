import { NextResponse } from "next/server";

const COLLECTION_SCHEMAS: Record<string, string[]> = {
  speakers: ["fullName", "email", "company", "title", "bio", "topic", "status", "eventId"],
  attendees: ["fullName", "email", "organization", "ticketType", "status", "eventId"],
  volunteers: ["fullName", "email", "role", "shift", "status", "eventId"],
  sponsors: ["companyName", "tier", "contact", "status", "eventId"],
  events: ["name", "venue", "city", "timezone", "startDate", "endDate", "status"],
  sessions: ["title", "abstract", "eventId", "speakerIds", "roomId", "startTime", "endTime", "track", "status"],
  rooms: ["eventId", "name", "capacity", "location", "setupStyle", "avNotes"],
  organizers: ["fullName", "email", "phone", "organization", "role", "eventId"],
  facilities: ["name", "type", "address", "capacity", "contactName", "contactEmail", "eventId"],
};

export async function POST(request: Request) {
  try {
    const { headers, collection } = await request.json();

    if (!headers || !collection || !COLLECTION_SCHEMAS[collection]) {
      return NextResponse.json(
        { success: false, error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const schemaFields = COLLECTION_SCHEMAS[collection];
    const mapping: Record<string, string> = {};

    // Simple heuristic mapping
    headers.forEach((header: string) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      const match = schemaFields.find(field => {
        const normalizedField = field.toLowerCase();
        return normalizedHeader === normalizedField || 
               normalizedHeader.includes(normalizedField) ||
               normalizedField.includes(normalizedHeader);
      });

      if (match) {
        mapping[header] = match;
      }
    });

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    return NextResponse.json({ success: true, mapping });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to generate mapping" },
      { status: 500 }
    );
  }
}
