"use client";

import {
  Info,
  Warning,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Incident } from "@/lib/hermes";
import { IconMap } from "@/lib/constants";
import { ImpactAnalysis } from "./impact-analysis";
import { RiskAssessment } from "./risk-assessment";
import { ResponseOptions } from "./response-options";
import { CommunicationPlan } from "./communication-plan";

export const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case "critical": return "bg-red-100 text-red-700 border-red-200";
    case "high": return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
    case "low": return "bg-blue-100 text-blue-700 border-blue-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "investigating": return "bg-purple-100 text-purple-700 border-purple-200";
    case "in progress": return "bg-blue-100 text-blue-700 border-blue-200";
    case "open": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "resolving": return "bg-sky-100 text-sky-700 border-sky-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

interface OperationalCardProps {
  incident: Incident;
  onActionDecision: (actionId: number, decision: 'approved' | 'modified') => void;
  onCustomPlan: (plan: string) => void;
  onGlobalDecision: (type: 'escalate' | 'resolve') => void;
}

export function OperationalCard({ 
  incident, 
  onActionDecision, 
  onCustomPlan,
  onGlobalDecision 
}: OperationalCardProps) {
  const Icon = IconMap[incident.iconName] || Warning;

  return (
    <Card className="w-full border-slate-200 shadow-xl bg-white overflow-hidden rounded-3xl">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-6 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl shadow-md",
              incident.severity === "Critical" ? "bg-red-600 text-white" : 
              incident.severity === "High" ? "bg-orange-500 text-white" :
              "bg-sky-600 text-white"
            )}>
              <Icon size={32} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("h-5 px-2 text-[10px] font-black border-2 uppercase tracking-wider", getSeverityColor(incident.severity))}>
                  {incident.severity}
                </Badge>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{incident.timestamp}</span>
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">{incident.title}</CardTitle>
            </div>
          </div>
          <Badge className={cn("px-3 py-1 text-xs font-bold border-2 rounded-full", getStatusColor(incident.status))}>
            {incident.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8 space-y-10 px-8">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <Info size={16} className="text-blue-500" />
            Operational Situation
          </h3>
          <p className="text-base text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
            {incident.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <ImpactAnalysis impacts={incident.impactAnalysis} />
          <RiskAssessment risk={incident.riskAssessment} />
        </div>

        <ResponseOptions 
          options={incident.responseOptions} 
          onActionDecision={onActionDecision} 
          onCustomPlan={onCustomPlan}
        />
        
        <CommunicationPlan communications={incident.communications} />

        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Execution Status</span>
          </div>
          <div className="bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-2xl border border-slate-800 shadow-2xl">
            <span className="text-sky-400">$</span> hermes-exec --status --incident {incident.id}
            <br />
            <span className="text-emerald-400">STATUS:</span> {incident.executionStatus}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
