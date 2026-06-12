"use client";

import { 
  FirstAid, 
  Wrench, 
  Shield, 
  WifiHigh, 
  Truck, 
  Warning, 
  MapPin, 
  Info,
  Lightbulb,
  CheckCircle
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReportedIssue } from "@/lib/hermes";
import { getSeverityColor } from "./operational-card";
import React from "react";

interface IssueReportCardProps {
  report: ReportedIssue;
}

const CategoryIconMap: Record<string, React.ElementType> = {
  Medical: FirstAid,
  Facility: Wrench,
  Security: Shield,
  Technical: WifiHigh,
  Logistics: Truck,
  General: Warning,
};

export function IssueReportCard({ report }: IssueReportCardProps) {
  const Icon = CategoryIconMap[report.category] || Warning;

  return (
    <Card className="w-full border-slate-200 shadow-xl bg-white overflow-hidden rounded-3xl">
      <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-6 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl shadow-md",
              report.severity === "Critical" ? "bg-red-600 text-white" : 
              report.severity === "High" ? "bg-orange-500 text-white" :
              "bg-sky-600 text-white"
            )}>
              <Icon size={32} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("h-5 px-2 text-[10px] font-black border-2 uppercase tracking-wider", getSeverityColor(report.severity))}>
                  {report.severity}
                </Badge>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{report.timestamp}</span>
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">{report.category} Issue Reported</CardTitle>
            </div>
          </div>
          <Badge className="px-3 py-1 text-xs font-bold border-2 rounded-full bg-emerald-100 text-emerald-700 border-emerald-200">
            {report.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8 space-y-6 px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-sky-500">
              <MapPin size={20} weight="fill" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extracted Location</p>
              <p className="text-sm font-bold text-slate-900">{report.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-amber-500">
              <Lightbulb size={20} weight="fill" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Intelligence</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {report.extractedSignals.length > 0 ? (
                  report.extractedSignals.map((signal, index) => (
                    <Badge key={index} variant="secondary" className="text-[9px] px-1.5 py-0 bg-white border-slate-200 text-slate-600 font-bold uppercase">
                      {signal}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs font-bold text-slate-500">Analyzing signals...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <Info size={16} className="text-blue-500" />
            Report Details
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100 italic">
            &quot;{report.description}&quot;
          </p>
        </div>

        <div className="bg-sky-50 border-2 border-sky-100 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Shield size={80} weight="fill" className="text-sky-600" />
          </div>
          <h3 className="flex items-center gap-2 text-xs font-black text-sky-700 uppercase tracking-widest mb-4">
            <CheckCircle size={18} weight="fill" />
            Escalation Guidance
          </h3>
          <p className="text-base font-bold text-slate-900 leading-relaxed relative z-10">
            {report.guidance}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-sky-600 uppercase tracking-widest bg-white/50 w-fit px-3 py-1 rounded-full border border-sky-100">
            Automated Protocol Active
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hermes Status</span>
          </div>
          <div className="bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-2xl border border-slate-800 shadow-2xl">
            <span className="text-emerald-400">SUCCESS:</span> Report {report.id} logged and routed to {report.category} response team.
            <br />
            <span className="text-sky-400">ACTION:</span> Monitoring for updates...
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
