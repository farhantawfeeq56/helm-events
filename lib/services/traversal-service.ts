import { connectToDatabase } from "@/lib/db";
import { Session } from "@/models/session";
import { Incident } from "@/models/incident";
import { Task } from "@/models/task";

// Ensure related models are registered for populate
import "@/models/room";
import "@/models/event";
import "@/models/speaker";

/**
 * Provides reusable functions to walk the operational graph.
 * This service allows for easy traversal between related entities
 * such as Speakers, Sessions, Rooms, Incidents, and Tasks.
 */

/**
 * Returns all sessions for a specific speaker, enriched with room, event, and speaker data.
 * @param speakerId The ID of the speaker
 */
export async function getSessionsForSpeaker(speakerId: string) {
  await connectToDatabase();
  return Session.find({ speakerIds: speakerId })
    .populate("roomId eventId speakerIds")
    .lean();
}

/**
 * Returns all sessions scheduled for a specific room, enriched with event and speaker data.
 * @param roomId The ID of the room
 */
export async function getSessionsForRoom(roomId: string) {
  await connectToDatabase();
  return Session.find({ roomId })
    .populate("eventId speakerIds")
    .lean();
}

/**
 * Returns all tasks associated with a specific incident, enriched with event and incident data.
 * @param incidentId The ID of the incident
 */
export async function getTasksForIncident(incidentId: string) {
  await connectToDatabase();
  return Task.find({ incidentId })
    .populate("eventId incidentId")
    .lean();
}

/**
 * Returns all incidents associated with a specific event.
 * @param eventId The ID of the event
 */
export async function getIncidentsForEvent(eventId: string) {
  await connectToDatabase();
  return Incident.find({ eventId }).lean();
}

/**
 * Returns all sessions scheduled for a specific event, enriched with room and speaker data.
 * @param eventId The ID of the event
 */
export async function getSessionsForEvent(eventId: string) {
  await connectToDatabase();
  return Session.find({ eventId })
    .populate("roomId speakerIds")
    .lean();
}
