"use client";

import { WarningCircle, Shield, TrendUp } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RiskAssessment } from "@/lib/hermes";
import { Risk } from "@/types/incident";

interface RisksProps {
  assessment?: RiskAssessment;
  detailedRisks: Risk[];
}

export function Risks({ assessment, detailedRisks }: RisksProps) {
  if (!assessment) return null;

  return (
    <div className="space-y-8">
      {/* High-Level Assessment */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
            <WarningCircle size={18} weight="bold" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Risk Assessment</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Overall Risk Level</span>
            <Badge className={cn(
              "px-3 py-1 text-xs font-black uppercase tracking-widest",
              assessment.level === "Critical" ? "bg-red-100 text-red-700" :
              assessment.level === "High" ? "bg-orange-100 text-orange-700" :
              assessment.level === "Medium" ? "bg-amber-100 text-amber-700" :
              "bg-blue-100 text-blue-700"
            )}>
              {assessment.level}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis</p>
            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
              &ldquo;{assessment.explanation}&rdquo;
            </p>
          </div>

          <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} weight="bold" className="text-indigo-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900">Primary Mitigation</p>
            </div>
            <p className="text-xs font-bold text-indigo-800 leading-relaxed">
              {assessment.mitigationStrategy}
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Risks */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <TrendUp size={18} weight="bold" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Identified Risk Factors</h2>
        </div>

        <div className="space-y-8">
          {detailedRisks.map((risk) => (
            <div key={risk.id} className="group space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">{risk.title}</h3>
                <Badge className={cn(
                  "text-[8px] font-black uppercase px-2",
                  risk.impact === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                )}>
                  {risk.impact} Impact
                </Badge>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 group-hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} weight="bold" className="text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mitigation Strategy</p>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  {risk.mitigation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
