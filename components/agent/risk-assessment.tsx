"use client";

import { ShieldWarning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RiskAssessment as RiskAssessmentType } from "@/lib/hermes";

interface RiskAssessmentProps {
  risk?: RiskAssessmentType;
}

export function RiskAssessment({ risk }: RiskAssessmentProps) {
  if (!risk) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        <ShieldWarning size={16} className="text-amber-500" />
        Risk Assessment
      </h3>
      <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-slate-900">Risk Level:</span>
          <Badge variant="outline" className={cn(
            "px-2 py-0.5 text-[10px] font-bold uppercase border-2",
            risk.level === "Critical" ? "border-red-200 text-red-600 bg-red-50" :
            risk.level === "High" ? "border-orange-200 text-orange-600 bg-orange-50" :
            risk.level === "Medium" ? "border-amber-200 text-amber-600 bg-amber-50" :
            "border-blue-200 text-blue-600 bg-blue-50"
          )}>
            {risk.level}
          </Badge>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">Analysis</p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {risk.explanation}
            </p>
          </div>
          <div className="pt-3 border-t border-amber-100/50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">Mitigation Strategy</p>
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              {risk.mitigationStrategy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
