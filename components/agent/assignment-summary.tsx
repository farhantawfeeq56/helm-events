"use client";

import { UserCircle, ArrowRight } from "@phosphor-icons/react";
import { AssignmentResult } from "@/types/agent";

interface AssignmentSummaryProps {
  assignments: AssignmentResult[];
}

/** Derive up-to-two-letter initials from an assignee name for the avatar. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AssignmentSummary({ assignments }: AssignmentSummaryProps) {
  if (!assignments || assignments.length === 0) return null;

  const count = assignments.length;

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          Task Dispatch
        </span>
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
          {count} assigned
        </span>
      </div>

      <div className="px-4 pt-3 pb-1">
        <p className="text-[11px] font-mono text-slate-500 tracking-tight">
          {count} task{count > 1 ? "s" : ""} dispatched to best-fit responders
          <span className="text-slate-600"> — matched on role, shift, and workload.</span>
        </p>
      </div>

      <div className="p-4 space-y-2.5">
        {assignments.map((a, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-xl bg-slate-800/40 border border-slate-700/40 px-3 py-2.5"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15 border border-sky-500/30">
              <span className="text-[10px] font-black text-sky-300 tracking-tighter">
                {initials(a.assignee)}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-semibold text-slate-100 truncate">{a.assignee}</span>
                <ArrowRight size={12} weight="bold" className="shrink-0 text-slate-500" />
                <span className="font-mono text-[13px] text-slate-300 truncate">{a.title}</span>
              </div>
              {a.reason && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-700/40 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  <UserCircle size={11} weight="bold" className="text-slate-500" />
                  {a.reason}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950/50 px-4 py-2.5 border-t border-slate-800/50">
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">
          Responders notified — completion reports return here
        </span>
      </div>
    </div>
  );
}
