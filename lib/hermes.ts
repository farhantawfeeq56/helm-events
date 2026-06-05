export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface RecommendedAction {
  id: number;
  action: string;
  status: "pending" | "approved" | "declined";
}

export interface RiskAssessment {
  level: string;
  explanation: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: string;
  timestamp: string;
  description: string;
  impact: string[];
  recommendedActions: RecommendedAction[];
  riskAssessment: RiskAssessment;
  executionStatus: string;
  iconName: string;
  color: string;
}

export interface HermesRequest {
  message: string;
  context?: any;
}

export interface HermesResponse {
  content: string;
  type: "text" | "operational-card";
  incidentData?: Incident;
}
