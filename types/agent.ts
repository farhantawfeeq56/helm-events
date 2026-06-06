import { Incident } from "@/lib/hermes";

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  type: "text" | "operational-card" | "execution-checklist";
  incidentData?: Incident;
  checklist?: { text: string; status: "pending" | "in-progress" | "completed" }[];
}

export interface OperationalAction {
  label: string;
  message: string;
  icon: any;
}
