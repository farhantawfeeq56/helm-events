import React from "react";
import { Incident, ChecklistItem, ReportedIssue } from "@/lib/hermes";

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  type: "text" | "operational-card" | "execution-checklist" | "issue-report";
  incidentData?: Incident;
  checklist?: ChecklistItem[];
  reportData?: ReportedIssue;
}

export interface OperationalAction {
  label: string;
  message: string;
  icon: React.ElementType;
}
