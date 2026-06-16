import { connectToDatabase } from "@/lib/db";
import { Speaker as SpeakerModel } from "@/models/speaker";
import { Room as RoomModel } from "@/models/room";
import { Incident as IncidentModel } from "@/models/incident";
import { Event as EventModel } from "@/models/event";
import {
  getSessionsForSpeaker,
  getSessionsForRoom,
  getTasksForIncident,
  getSessionsForEvent,
  getIncidentsForEvent,
} from "@/lib/services/traversal-service";
import { formatContext } from "./contextFormatter";
import { Speaker, Room, Incident, Event } from "@/types/data-hub";

/**
 * Aggregates and formats context for a speaker, including their sessions.
 * Normalizes 'fullName' to 'name' for consistent formatting.
 * 
 * @param speakerId The ID of the speaker
 * @returns Formatted string context
 */
export async function getSpeakerContext(speakerId: string): Promise<string> {
  await connectToDatabase();
  const speaker = await SpeakerModel.findById(speakerId).lean() as Speaker | null;
  if (!speaker) return "Speaker not found.";

  const sessions = await getSessionsForSpeaker(speakerId);
  
  // Normalize for formatter: mapping fullName to name so it's used as the header
  const data = {
    ...speaker,
    name: speaker.fullName,
    sessions,
  };

  return formatContext(data, "Speaker");
}

/**
 * Aggregates and formats context for a room, including scheduled sessions.
 * 
 * @param roomId The ID of the room
 * @returns Formatted string context
 */
export async function getRoomContext(roomId: string): Promise<string> {
  await connectToDatabase();
  const room = await RoomModel.findById(roomId).lean() as Room | null;
  if (!room) return "Room not found.";

  const sessions = await getSessionsForRoom(roomId);
  const data = {
    ...room,
    sessions,
  };

  return formatContext(data, "Room");
}

/**
 * Aggregates and formats context for an incident, including related tasks.
 * Normalizes 'type' to 'name' for consistent formatting.
 * 
 * @param incidentId The ID of the incident
 * @returns Formatted string context
 */
export async function getIncidentContext(incidentId: string): Promise<string> {
  await connectToDatabase();
  const incident = await IncidentModel.findById(incidentId).lean() as Incident | null;
  if (!incident) return "Incident not found.";

  const tasks = await getTasksForIncident(incidentId);
  
  // Normalize for formatter: mapping type to name so it's used as the header
  const data = {
    ...incident,
    name: incident.type,
    tasks,
  };

  return formatContext(data, "Incident");
}

/**
 * Aggregates and formats context for an event, including its sessions and incidents.
 *
 * @param eventId The ID of the event
 * @returns Formatted string context
 */
export async function getEventContext(eventId: string): Promise<string> {
  await connectToDatabase();
  const event = await EventModel.findById(eventId).lean() as Event | null;
  if (!event) return "Event not found.";

  const sessions = await getSessionsForEvent(eventId);
  const incidents = await getIncidentsForEvent(eventId);
  const data = {
    ...event,
    sessions,
    incidents,
  };

  return formatContext(data, "Event");
}

/**
 * Returns the currently-active event (the most recently created one).
 * The app treats the latest event as the live event being operated.
 */
export async function getActiveEvent(): Promise<Event | null> {
  await connectToDatabase();
  return EventModel.findOne().sort({ createdAt: -1 }).lean() as Promise<Event | null>;
}

/**
 * Formatted context string for the active event — fed to Hermes so the agent
 * reasons over the real schedule, sessions, and open incidents instead of
 * operating blind. Returns null (not an error) if there is no event or the DB
 * is unreachable, so the Hermes flow degrades gracefully to "no context".
 */
export async function getActiveEventContext(): Promise<string | null> {
  try {
    const event = await getActiveEvent();
    if (!event?._id) return null;
    return await getEventContext(String(event._id));
  } catch (error) {
    console.error("getActiveEventContext failed:", error);
    return null;
  }
}
