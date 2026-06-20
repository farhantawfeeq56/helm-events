import React from "react";
import { Incident, ChecklistItem, ReportedIssue } from "@/lib/hermes";

/** A single task-routing result surfaced by the assignment UI (Workstream 2). */
export interface AssignmentResult {
  title: string;
  assignee: string;
  reason: string;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  type: "text" | "clarification" | "operational-card" | "execution-checklist" | "issue-report" | "assignment";
  incidentData?: Incident;
  checklist?: ChecklistItem[];
  reportData?: ReportedIssue;
  // clarification: the specific questions Hermes needs answered before acting.
  questions?: string[];
  // assignment: who each dispatched task went to, and why.
  assignments?: AssignmentResult[];
  // execution-checklist: when set, the monitor polls live task progress for this incident.
  incidentSlug?: string;
}

export interface OperationalAction {
  label: string;
  message: string;
  icon: React.ElementType;
}
