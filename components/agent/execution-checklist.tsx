"use client";

import { useEffect, useState } from "react";
import { CheckCircle, CircleNotch, Circle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  text: string;
  status: "pending" | "in-progress" | "completed";
}

interface ExecutionChecklistProps {
  steps: ChecklistItem[];
  /**
   * When set, the monitor polls live task progress for this incident
   * (`GET /api/incidents/[slug]/execution`) and renders the real step
   * statuses. Falls back to the passed `steps` until tasks are dispatched.
   */
  incidentSlug?: string;
}

const POLL_INTERVAL_MS = 4000;

export function ExecutionChecklist({ steps, incidentSlug }: ExecutionChecklistProps) {
  const [liveSteps, setLiveSteps] = useState<ChecklistItem[] | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentSlug) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/incidents/${encodeURIComponent(incidentSlug)}/execution`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        // Only switch to live steps once real tasks exist; otherwise keep the
        // agent's initial snapshot so the monitor is never empty.
        if (data?.linked && Array.isArray(data.steps) && data.steps.length > 0) {
          setLiveSteps(data.steps as ChecklistItem[]);
          setStatusLine(typeof data.executionStatus === "string" ? data.executionStatus : null);
        }
      } catch {
        // transient network error — keep last known state, try again next tick
      }
    };

    poll();
    const handle = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(handle);
    };
  }, [incidentSlug]);

  const rendered = liveSteps ?? steps;
  const completedCount = rendered.filter((s) => s.status === "completed").length;
  const isLive = Boolean(incidentSlug);

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500/80" />
            <div className="h-2 w-2 rounded-full bg-amber-500/80" />
            <div className="h-2 w-2 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-2">Execution Monitor</span>
        </div>
        <span className="text-[10px] font-mono text-sky-400 animate-pulse uppercase">
          {isLive ? "Live" : "Snapshot"}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {rendered.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3 transition-all duration-300",
              step.status === "completed" ? "opacity-100" :
              step.status === "in-progress" ? "opacity-100" : "opacity-40"
            )}
          >
            <div className="mt-0.5">
              {step.status === "completed" ? (
                <CheckCircle size={18} weight="fill" className="text-emerald-500" />
              ) : step.status === "in-progress" ? (
                <CircleNotch size={18} weight="bold" className="text-sky-400 animate-spin" />
              ) : (
                <Circle size={18} weight="bold" className="text-slate-600" />
              )}
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "text-sm font-mono tracking-tight",
                step.status === "completed" ? "text-slate-400 line-through decoration-slate-600" :
                step.status === "in-progress" ? "text-sky-100" : "text-slate-500"
              )}>
                {step.text}
              </span>
              {step.status === "in-progress" && (
                <span className="text-[10px] font-mono text-sky-500/70 mt-1 uppercase tracking-tighter">
                  Processing...
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/50 px-5 py-3 border-t border-slate-800/50">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-600 uppercase tracking-tighter">
            {statusLine ?? "System: Hermes-OS v2.4.0"}
          </span>
          <span className="text-slate-600 uppercase tracking-tighter">Task: {completedCount}/{rendered.length} Complete</span>
        </div>
      </div>
    </div>
  );
}
