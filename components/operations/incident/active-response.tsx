"use client";

import { useEffect, useState } from "react";
import { CheckCircle, CircleNotch, Circle, Lightning } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RecommendedAction, ChecklistItem } from "@/lib/hermes";

interface ActiveResponseProps {
  incidentId: string;
  option: RecommendedAction;
  /** Server-rendered headline; replaced by the live one once polling resolves. */
  executionStatus: string;
}

const POLL_INTERVAL_MS = 4000;

/**
 * Shown on the incident page once a response option has been approved (or
 * modified-and-approved). Replaces the full option list with just the active
 * response: the chosen plan plus a live view of its dispatched tasks, polled
 * from `/api/incidents/[id]/execution`. This is the "what's happening now" view.
 */
export function ActiveResponse({ incidentId, option, executionStatus }: ActiveResponseProps) {
  const [steps, setSteps] = useState<ChecklistItem[]>(option.steps ?? []);
  const [statusLine, setStatusLine] = useState<string>(executionStatus);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/execution`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        if (data?.linked && Array.isArray(data.steps) && data.steps.length > 0) {
          setSteps(data.steps as ChecklistItem[]);
          if (typeof data.executionStatus === "string") setStatusLine(data.executionStatus);
        }
      } catch {
        // transient — keep last known state
      }
    };

    poll();
    const handle = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [incidentId]);

  const completed = steps.filter((s) => s.status === "completed").length;
  const isModified = option.status === "modified";

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Lightning size={18} weight="fill" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Active Response</h2>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      <div className="overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
        <div className="border-b-2 border-slate-900 bg-emerald-50 px-8 py-5">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
              {isModified ? "Modified · Approved" : "Approved"}
            </Badge>
            <Badge className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
              option.priority === "high" ? "bg-rose-100 text-rose-700" :
              option.priority === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
            )}>
              {option.priority} Priority
            </Badge>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{option.title}</h3>
        </div>

        <div className="px-8 py-6">
          <p className="text-slate-600 font-medium leading-relaxed mb-6">{option.summary}</p>

          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Execution Progress
            </h4>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 tabular-nums">
              {completed}/{steps.length} done
            </span>
          </div>

          {steps.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              Dispatching tasks…
            </p>
          ) : (
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  {step.status === "completed" ? (
                    <CheckCircle size={18} weight="fill" className="text-emerald-500 shrink-0" />
                  ) : step.status === "in-progress" ? (
                    <CircleNotch size={18} weight="bold" className="text-amber-500 animate-spin shrink-0" />
                  ) : (
                    <Circle size={18} weight="bold" className="text-slate-300 shrink-0" />
                  )}
                  <span className={cn(
                    "text-sm font-bold",
                    step.status === "completed" ? "text-slate-400 line-through" : "text-slate-700"
                  )}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t-2 border-slate-900 bg-slate-900 px-8 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
          <p className="text-sm font-bold text-white leading-relaxed">{statusLine}</p>
        </div>
      </div>
    </section>
  );
}
