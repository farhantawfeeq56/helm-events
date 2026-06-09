import { Speaker, Session, Room, Incident, Task, Event } from "./data-hub";

export interface SpeakerContextData extends Speaker {
  sessions: Session[];
}

export interface RoomContextData extends Room {
  sessions: Session[];
}

export interface IncidentContextData extends Incident {
  tasks: Task[];
}

export interface EventContextData extends Event {
  sessions: Session[];
  incidents: Incident[];
}
