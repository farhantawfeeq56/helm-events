"use client";

import { CaretRight, Warning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Incident } from "@/lib/hermes";
import { getSeverityColor } from "./operational-card";
import { IconMap } from "@/lib/constants";

interface IncidentListItemProps {
  incident: Incident;
  onClick: () => void;
}

export function IncidentListItem({ incident, onClick }: IncidentListItemProps) {
  const Icon = IconMap[incident.iconName] || Warning;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-2xl border p-4 transition-all hover:shadow-md cursor-pointer",
        incident.severity === "Critical" 
          ? "border-red-100 bg-red-50/50 hover:bg-red-50" 
          : "border-slate-200 bg-white/60 hover:bg-white"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl",
          incident.severity === "Critical" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
        )}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {incident.title}
            </span>
            <Badge className={cn("h-4 px-1.5 text-[10px] font-medium border", getSeverityColor(incident.severity))}>
              {incident.severity}
            </Badge>
          </div>
          <span className="text-xs text-slate-500">
            {incident.status} • {incident.timestamp}
          </span>
        </div>
      </div>
      <CaretRight size={18} className="text-slate-400" />
    </div>
  );
}
