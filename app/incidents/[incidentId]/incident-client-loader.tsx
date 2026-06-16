"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  Pulse,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Situation } from "@/components/operations/incident/situation";
import { Impact } from "@/components/operations/incident/impact";
import { ResponseOptions } from "@/components/operations/incident/response-options";
import { Risks } from "@/components/operations/incident/risks";
import { Communications } from "@/components/operations/incident/communications";
import { Incident as HermesIncident } from "@/lib/hermes";
import { Incident } from "@/types/incident";

function mapToFullIncident(h: HermesIncident): Incident {
  return {
    ...h,
    situation: h.description,
    affectedResources: [],
    timeline: [],
    risks: [],
    eventId: "live-session",
  };
}

function getSeverityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical": return "bg-rose-100 text-rose-700 border-rose-200";
    case "high": return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
    case "low": return "bg-blue-100 text-blue-700 border-blue-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "resolved": return "text-emerald-600";
    case "investigating": return "text-amber-600";
    case "in progress": return "text-blue-600";
    default: return "text-slate-600";
  }
}

export function IncidentClientLoader({ incidentId }: { incidentId: string }) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(`hermes:incident:${incidentId}`);
    if (raw) {
      try {
        const hermesIncident = JSON.parse(raw) as HermesIncident;
        setIncident(mapToFullIncident(hermesIncident));
      } catch {
        // malformed localStorage entry
      }
    }
    setLoading(false);
  }, [incidentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Pulse size={20} className="animate-pulse" />
          <span className="text-sm font-black uppercase tracking-widest">Loading incident data...</span>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-md">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Incident Not Found</p>
          <p className="text-sm font-medium text-slate-500 mb-6">
            This incident is not in the current session. It may have been created in a previous session.
          </p>
          <Link href="/incidents" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            <ArrowLeft size={16} weight="bold" />
            Back to Incidents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={16} weight="bold" />
          BACK TO INCIDENTS
        </Link>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={cn("text-xs font-black uppercase tracking-widest px-3 py-1", getSeverityColor(incident.severity))}>
              {incident.severity} SEVERITY
            </Badge>
            <div className={cn("flex items-center gap-2 text-sm font-bold", getStatusColor(incident.status))}>
              <Circle size={8} weight="fill" />
              <span className="uppercase tracking-widest">{incident.status}</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
            {incident.title}
          </h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="lg:col-span-2 space-y-12">
            <Situation situation={incident.situation} />
            <ResponseOptions options={incident.responseOptions} />
            <Impact
              affectedResources={incident.affectedResources}
              impactAnalysis={incident.impactAnalysis}
            />
            <Communications communications={incident.communications} />

            {incident.timeline && incident.timeline.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Clock size={18} weight="bold" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Incident Timeline</h2>
                </div>
                <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                  {incident.timeline.map((event) => (
                    <div key={event.id} className="relative pl-12">
                      <div className={cn(
                        "absolute left-0 flex items-center justify-center w-10 h-10 rounded-xl border-4 border-slate-50 z-10 shadow-sm",
                        event.status === "completed" ? "bg-emerald-500" : "bg-indigo-500"
                      )}>
                        {event.status === "completed" ? (
                          <CheckCircle size={18} className="text-white" weight="bold" />
                        ) : (
                          <Pulse size={18} className="text-white" weight="bold" />
                        )}
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{event.title}</h3>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{event.timestamp}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8 lg:sticky lg:top-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">Quick Facts</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Incident ID</p>
                  <p className="font-black text-slate-900 uppercase tracking-tight">#{incident.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reported At</p>
                  <p className="font-black text-slate-900 uppercase tracking-tight">{incident.timestamp}</p>
                </div>
                <div className="pt-4">
                  <div className="rounded-2xl bg-slate-900 p-6 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Response Status</p>
                    <p className="text-sm font-bold leading-relaxed">{incident.executionStatus}</p>
                  </div>
                </div>
              </div>
            </section>
            <Risks assessment={incident.riskAssessment} detailedRisks={incident.risks} />
          </div>
        </div>
      </div>
    </div>
  );
}
