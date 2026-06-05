"use client";

import { useState } from "react";
import {
  Info,
  Pulse,
  ShieldWarning,
  CheckCircle,
  Check,
  X,
  Warning,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Incident } from "@/lib/hermes";
import { IconMap } from "@/lib/constants";

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
  onActionDecision: (actionId: number, decision: 'approved' | 'declined') => void;
  onGlobalDecision: (type: 'escalate' | 'resolve') => void;
}

export function OperationalCard({ 
  incident, 
  onActionDecision, 
  onGlobalDecision 
}: OperationalCardProps) {
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'declined'>>({});

  const handleDecision = (id: number, decision: 'approved' | 'declined') => {
    setDecisions(prev => ({ ...prev, [id]: decision }));
    onActionDecision(id, decision);
  };

  const Icon = IconMap[incident.iconName] || Warning;

  return (
    <Card className="w-full border-slate-200 shadow-lg bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
              incident.severity === "Critical" ? "bg-red-100 text-red-600" : "bg-sky-100 text-sky-600"
            )}>
              <Icon size={24} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">{incident.title}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={cn("h-4 px-1.5 text-[10px] font-bold border uppercase", getSeverityColor(incident.severity))}>
                  {incident.severity}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">{incident.timestamp}</span>
              </div>
            </div>
          </div>
          <Badge className={cn("px-2 py-0.5 text-xs font-semibold border", getStatusColor(incident.status))}>
            {incident.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Info size={16} className="text-blue-500" />
            Situation
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {incident.description}
          </p>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Pulse size={16} className="text-orange-500" />
            Impact Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {incident.impact.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <ShieldWarning size={16} className="text-amber-500" />
            Risk Assessment
          </h3>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-900">Level:</span>
              <Badge variant="outline" className={cn(
                "px-1.5 py-0 text-[10px] font-bold uppercase",
                incident.riskAssessment.level === "High" ? "border-red-200 text-red-600 bg-red-50" :
                incident.riskAssessment.level === "Medium" ? "border-amber-200 text-amber-600 bg-amber-50" :
                "border-blue-200 text-blue-600 bg-blue-50"
              )}>
                {incident.riskAssessment.level}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {incident.riskAssessment.explanation}
            </p>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <CheckCircle size={16} className="text-emerald-500" />
            Recommended Actions
          </h3>
          <div className="space-y-2">
            {incident.recommendedActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <span className="text-sm font-medium text-slate-700">{action.action}</span>
                <div className="flex items-center gap-2">
                  {decisions[action.id] === 'approved' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                      <Check size={12} weight="bold" /> Approved
                    </Badge>
                  ) : decisions[action.id] === 'declined' ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                      <X size={12} weight="bold" /> Declined
                    </Badge>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDecision(action.id, 'approved')}
                        className="h-8 px-3 rounded-lg border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDecision(action.id, 'declined')}
                        className="h-8 px-3 rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      >
                        Decline
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
          onClick={() => onGlobalDecision('escalate')}
        >
          Escalate to Director
        </Button>
        <Button 
          className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => onGlobalDecision('resolve')}
        >
          Mark as Resolved
        </Button>
      </CardFooter>
    </Card>
  );
}
