"use client";

import { Sparkle, Info, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/agent";
import { ExecutionChecklist } from "./execution-checklist";
import { IssueReportCard } from "./issue-report-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconMap } from "@/lib/constants";
import { getSeverityColor, getStatusColor } from "./operational-card";
import { ImpactAnalysis } from "./impact-analysis";

interface VolunteerMessageItemProps {
  message: Message;
}

export function VolunteerMessageItem({ message }: VolunteerMessageItemProps) {
  const incident = message.incidentData;
  const Icon = incident ? (IconMap[incident.iconName] || Warning) : Warning;

  return (
    <div
      className={cn(
        "flex w-full flex-col scroll-mt-10",
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      {message.role === "agent" && (
        <div className="mb-2 flex items-center gap-2 ml-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm border border-slate-700">
            <Sparkle size={12} weight="fill" className="text-sky-400" />
          </div>
          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">HERMES.VOLUNTEER</span>
        </div>
      )}
      
      {message.type === "operational-card" && incident ? (
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="mb-4 text-slate-700 ml-1 font-medium">{message.content}</p>
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
            
            <CardContent className="pt-8 space-y-6 px-8">
              <div>
                <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <Info size={16} className="text-blue-500" />
                  Summary
                </h3>
                <p className="text-base text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                  {incident.description}
                </p>
              </div>

              <ImpactAnalysis impacts={incident.impactAnalysis} />

              <div className="pt-4 pb-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Execution Status</span>
                </div>
                <div className="bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-2xl border border-slate-800 shadow-2xl">
                  <span className="text-emerald-400">STATUS:</span> {incident.executionStatus}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : message.type === "execution-checklist" && message.checklist ? (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="mb-4 text-slate-700 ml-1 font-medium">{message.content}</p>
          <ExecutionChecklist steps={message.checklist} />
        </div>
      ) : message.type === "issue-report" && message.reportData ? (
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="mb-4 text-slate-700 ml-1 font-medium">{message.content}</p>
          <IssueReportCard report={message.reportData} />
        </div>
      ) : (
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
            message.role === "user"
              ? "bg-sky-600 text-white font-medium"
              : "bg-white border border-slate-200 text-slate-700 font-medium"
          )}
        >
          {message.content}
        </div>
      )}
    </div>
  );
}

export function VolunteerTypingIndicator() {
  return (
    <div className="flex flex-col items-start">
      <div className="mb-2 flex items-center gap-2 ml-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm border border-slate-700">
          <Sparkle size={12} weight="fill" className="text-sky-400" />
        </div>
        <span className="text-xs font-black text-slate-900 uppercase tracking-widest">HERMES.VOLUNTEER</span>
      </div>
      <div className="flex gap-1.5 rounded-2xl bg-white border border-slate-200 px-4 py-4 shadow-sm">
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]"></div>
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]"></div>
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"></div>
      </div>
    </div>
  );
}
