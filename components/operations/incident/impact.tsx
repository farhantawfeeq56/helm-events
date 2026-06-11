"use client";

import { Pulse, MapPin, User, Broadcast, IdentificationCard, Calendar } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AffectedResource } from "@/types/incident";

interface ImpactProps {
  affectedResources: AffectedResource[];
  impactAnalysis: string[];
}

export function Impact({ affectedResources, impactAnalysis }: ImpactProps) {
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "room": return <MapPin size={24} weight="duotone" />;
      case "speaker": return <User size={24} weight="duotone" />;
      case "session": return <Broadcast size={24} weight="duotone" />;
      case "sponsor": return <IdentificationCard size={24} weight="duotone" />;
      default: return <Calendar size={24} weight="duotone" />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Impact Analysis - AI Insights */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Pulse size={18} weight="bold" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">AI Impact Analysis</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {impactAnalysis.map((impact, index) => (
            <div key={index} className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-sm font-bold text-indigo-900">{impact}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Affected Resources */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Pulse size={18} weight="bold" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Affected Resources</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {affectedResources.map((resource) => (
            <div key={resource.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-900 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    resource.impact === "high" ? "bg-rose-50 text-rose-600" : 
                    resource.impact === "medium" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {getResourceIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">{resource.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{resource.type}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "text-[10px] font-black uppercase tracking-tighter",
                  resource.impact === "high" ? "bg-rose-100 text-rose-700" : 
                  resource.impact === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                )}>
                  {resource.impact} Impact
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
