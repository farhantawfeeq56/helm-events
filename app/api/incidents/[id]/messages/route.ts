import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { IncidentMessage } from "@/models/incident-message";
import { logActivity } from "@/lib/activity-logger";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const messages = await IncidentMessage.find({ incidentId: id }).sort({ createdAt: 1 }).lean();
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching incident messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

/**
 * Posts a coordination update to the incident thread. The sender defaults to the
 * signed-in user, and the update is logged to the activity feed so it surfaces
 * on both the volunteer and organizer sides of the incident.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    const sender = body.sender || {
      id: session?.email || "user",
      name: session?.name || "User",
      role: session?.role || "volunteer",
    };

    const content = (body.content || "").trim();
    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const message = await IncidentMessage.create({ incidentId: id, sender, content });

    const incident = await Incident.findById(id).select("title type slug").lean() as
      | { title?: string; type?: string; slug?: string; _id?: unknown }
      | null;
    const title = incident?.title || incident?.type || "incident";
    const key = incident?.slug || id;
    await logActivity({
      user: sender.name,
      type: "human",
      action: "incident_update",
      target: `incident:${key}`,
      details: `${sender.name} posted a coordination update on incident "${title}": "${content.slice(0, 120)}"`,
    }).catch(() => {});

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating incident message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
