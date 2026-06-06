"use client";

import { Pulse } from "@phosphor-icons/react";

interface ImpactAnalysisProps {
  impacts: string[];
}

export function ImpactAnalysis({ impacts }: ImpactAnalysisProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        <Pulse size={16} className="text-orange-500" />
        Impact
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {impacts.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50/30">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
