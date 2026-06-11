import { Severity as HermesSeverity, RecommendedAction, RiskAssessment, CommunicationPlan } from "@/lib/hermes";

export type Severity = HermesSeverity;

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: "incident_report" | "investigation" | "mitigation" | "resolution" | "communication";
  status: "completed" | "in-progress" | "pending";
}

export interface AffectedResource {
  id: string;
  name: string;
  type: "room" | "speaker" | "session" | "sponsor" | "facility";
  impact: "high" | "medium" | "low";
  status: string;
}

export interface Risk {
  id: string;
  title: string;
  probability: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  mitigation: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  timestamp: string;
  description: string;
  situation: string;
  impactAnalysis: string[];
  affectedResources: AffectedResource[];
  timeline: TimelineEvent[];
  risks: Risk[];
  riskAssessment: RiskAssessment;
  responseOptions: RecommendedAction[];
  communications: CommunicationPlan[];
  executionStatus: string;
  iconName: string;
  color: string;
  eventId: string;
}
