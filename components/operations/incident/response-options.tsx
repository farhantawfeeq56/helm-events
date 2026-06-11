"use client";

import { CheckCircle, Circle, ArrowRight } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RecommendedAction } from "@/lib/hermes";

interface ResponseOptionsProps {
  options: RecommendedAction[];
}

export function ResponseOptions({ options }: ResponseOptionsProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <CheckCircle size={18} weight="bold" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Recommended Responses</h2>
      </div>
      <div className="space-y-6">
        {options.map((option) => (
          <div key={option.id} className="group relative overflow-hidden rounded-3xl border-2 border-slate-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
                    option.priority === "high" ? "bg-rose-100 text-rose-700" : 
                    option.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {option.priority} Priority
                  </Badge>
                  {option.status === "approved" && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                      Approved
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{option.title}</h3>
              </div>
              <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold uppercase tracking-widest text-xs h-10 px-6">
                Approve Action
                <ArrowRight weight="bold" className="ml-2" />
              </Button>
            </div>

            <p className="text-slate-600 font-medium leading-relaxed mb-8">
              {option.summary}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Pros</h4>
                <ul className="space-y-2">
                  {option.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-bold text-slate-700">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Cons</h4>
                <ul className="space-y-2">
                  {option.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-bold text-slate-700">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {option.steps && option.steps.length > 0 && (
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Execution Checklist</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {option.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                      {step.status === "completed" ? (
                        <CheckCircle size={18} weight="fill" className="text-emerald-500" />
                      ) : step.status === "in-progress" ? (
                        <Circle size={18} weight="bold" className="text-amber-500 animate-pulse" />
                      ) : (
                        <Circle size={18} weight="bold" className="text-slate-300" />
                      )}
                      <span className={cn(
                        "text-xs font-bold",
                        step.status === "completed" ? "text-slate-400 line-through" : "text-slate-700"
                      )}>
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
