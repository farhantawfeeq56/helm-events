"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretRight, Warning, Clock, Circle, Sparkle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Incident as HermesIncident } from "@/lib/hermes";

const STORAGE_PREFIX = "hermes:incident:";

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

/**
 * Renders incidents created live by the Hermes agent this session.
 *
 * Agent incidents are persisted to localStorage (see hooks/use-agent.ts) because
 * the MongoDB Incident schema doesn't carry the rich Hermes fields. The server-
 * rendered list below only shows seed incidents, so without this the agent's
 * own incidents would never appear in history.
 */
export function AgentIncidents() {
  const [incidents, setIncidents] = useState<HermesIncident[]>([]);

  useEffect(() => {
    const found: HermesIncident[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key) ?? "");
        if (parsed && parsed.id && parsed.title) found.push(parsed as HermesIncident);
      } catch {
        // skip malformed entry
      }
    }
    setIncidents(found.reverse()); // most-recently-keyed first
  }, []);

  if (incidents.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
          <Sparkle size={12} weight="fill" className="text-sky-400" />
        </div>
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
          Live Session — Created by Hermes
        </h2>
      </div>

      <div className="grid gap-4">
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/incidents/${incident.id}`}
            className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-indigo-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-400 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4 sm:items-center">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                incident.severity === "Critical" ? "bg-rose-50 text-rose-600" :
                incident.severity === "High" ? "bg-orange-50 text-orange-600" :
                "bg-amber-50 text-amber-600"
              )}>
                <Warning size={28} weight="duotone" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{incident.title}</h3>
                  <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-wider", getSeverityColor(incident.severity))}>
                    {incident.severity}
                  </Badge>
                </div>
                <p className="line-clamp-1 text-sm text-slate-500 max-w-xl font-medium">
                  {incident.description}
                </p>
                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Clock size={14} weight="bold" />
                    <span>{incident.timestamp}</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-xs font-bold", getStatusColor(incident.status))}>
                    <Circle size={8} weight="fill" />
                    <span className="uppercase tracking-wide">{incident.status}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end sm:mt-0">
              <div className="flex items-center gap-2 text-sm font-black text-indigo-600 transition-transform group-hover:translate-x-1 sm:ml-8">
                DETAILS
                <CaretRight size={16} weight="bold" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
