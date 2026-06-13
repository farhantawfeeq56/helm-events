"use client";

import { useMemo } from "react";
import {
  WarningOctagon,
  Warning,
  CircleNotch,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockIncidents } from "@/lib/mock/volunteer";

const severityConfig = {
  critical: {
    label: "Critical",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: WarningOctagon,
  },
  high: {
    label: "High",
    className: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Warning,
  },
  medium: {
    label: "Medium",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
  low: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    icon: CircleNotch,
  },
} as const;

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  investigating: "bg-amber-100 text-amber-700 border-amber-200",
  mitigated: "bg-indigo-100 text-indigo-700 border-indigo-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

export default function VolunteerIncidentsPage() {
  const stats = useMemo(() => {
    return {
      total: mockIncidents.length,
      open: mockIncidents.filter((i) => i.status === "open").length,
      investigating: mockIncidents.filter((i) => i.status === "investigating").length,
      resolved: mockIncidents.filter((i) => i.status === "resolved" || i.status === "closed").length,
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <WarningOctagon className="text-indigo-600" />
          Incidents
        </h1>
        <p className="text-slate-500">Reported incidents requiring attention.</p>
      </header>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest">Total</CardTitle>
            <WarningOctagon className="h-4 w-4 text-slate-500" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-blue-900 uppercase tracking-widest">Open</CardTitle>
            <Warning className="h-4 w-4 text-blue-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.open}</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-amber-900 uppercase tracking-widest">Investigating</CardTitle>
            <CircleNotch className="h-4 w-4 text-amber-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{stats.investigating}</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Incident List */}
      <div className="grid gap-4">
        {mockIncidents.map((incident) => {
          const sevConfig = severityConfig[incident.severity];
          const SevIcon = sevConfig.icon;

          return (
            <Card
              key={incident.id}
              className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div
                    className={`w-1.5 shrink-0 ${
                      incident.severity === "critical"
                        ? "bg-red-500"
                        : incident.severity === "high"
                          ? "bg-orange-500"
                          : incident.severity === "medium"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                    }`}
                  />
                  <div className="p-5 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 text-lg">{incident.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("capitalize font-semibold", sevConfig.className)}>
                          <SevIcon size={14} className="mr-1" weight="bold" />
                          {sevConfig.label}
                        </Badge>
                        <Badge variant="outline" className={cn("capitalize font-semibold", statusColors[incident.status])}>
                          {incident.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{incident.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-slate-400" weight="bold" />
                        <span>{incident.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-slate-400" weight="bold" />
                        <span>{formatDate(incident.reportedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}