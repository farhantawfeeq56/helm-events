"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Warning,
  Prohibit,
  Clock,
  CircleNotch,
  CheckCircle,
  User,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { TaskOpsControls } from "./task-ops-controls";

interface AttentionTask {
  _id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo: string;
  assignedBy: string;
  dueAt: string | null;
  dueLabel: string | null;
  blockedReason: string;
  escalationLevel: number;
  minutesOverdue: number;
  overdue: boolean;
}

interface AttentionData {
  overdue: AttentionTask[];
  blocked: AttentionTask[];
  escalated: AttentionTask[];
  counts: { overdue: number; blocked: number; escalated: number; total: number };
}

const priorityDot: Record<string, string> = { high: "bg-rose-500", medium: "bg-amber-500", low: "bg-slate-400" };

export function TaskOperationsBoard() {
  const [data, setData] = useState<AttentionData | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks/attention");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setEventName(json.eventName);
      }
    } catch {
      /* keep prior */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <CircleNotch size={40} className="animate-spin mb-3" />
        <p className="text-sm font-medium">Scanning for at-risk work…</p>
      </div>
    );
  }

  if (!data || data.counts.total === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 py-20 text-center">
        <CheckCircle size={36} className="mx-auto mb-3 text-emerald-400" weight="duotone" />
        <h3 className="text-lg font-semibold text-slate-900">Nothing needs attention</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          No blocked, overdue, or escalated tasks{eventName ? ` on ${eventName}` : ""}. All work is on track.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <CountCard label="Escalated" value={data.counts.escalated} tone="orange" icon={<Warning weight="bold" />} />
        <CountCard label="Blocked" value={data.counts.blocked} tone="rose" icon={<Prohibit weight="bold" />} />
        <CountCard label="Overdue" value={data.counts.overdue} tone="amber" icon={<Clock weight="bold" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Column title="Escalated" tone="orange" tasks={data.escalated} onChanged={load} />
        <Column title="Blocked" tone="rose" tasks={data.blocked} onChanged={load} />
        <Column title="Overdue" tone="amber" tasks={data.overdue} onChanged={load} />
      </div>
    </div>
  );
}

function CountCard({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: React.ReactNode }) {
  const tones: Record<string, string> = {
    orange: "border-orange-100 bg-orange-50/50 text-orange-700",
    rose: "border-rose-100 bg-rose-50/50 text-rose-700",
    amber: "border-amber-100 bg-amber-50/50 text-amber-700",
  };
  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm", tones[tone])}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}

function Column({ title, tone, tasks, onChanged }: { title: string; tone: string; tasks: AttentionTask[]; onChanged: () => void }) {
  const bar: Record<string, string> = { orange: "bg-orange-500", rose: "bg-rose-500", amber: "bg-amber-500" };
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <span className={cn("h-2 w-2 rounded-full", bar[tone])} />
        {title} <span className="text-slate-300">·</span> <span className="text-slate-400">{tasks.length}</span>
      </h3>
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3 py-6 text-center text-xs text-slate-400">Clear</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <TaskCard key={t._id} task={t} barColor={bar[tone]} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, barColor, onChanged }: { task: AttentionTask; barColor: string; onChanged: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex">
        <div className={cn("w-1.5 shrink-0", barColor)} />
        <div className="flex-1 p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <Link href={`/operations/tasks/${task._id}`} className="font-bold text-slate-900 hover:text-indigo-600">
              {task.title}
            </Link>
            <Link href={`/operations/tasks/${task._id}`} className="shrink-0 text-slate-300 hover:text-indigo-600">
              <ArrowSquareOut size={16} weight="bold" />
            </Link>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", priorityDot[task.priority] || priorityDot.low)} />
              {task.priority}
            </span>
            <span className="inline-flex items-center gap-1">
              <User size={12} weight="bold" /> {task.assignedTo || "Unassigned"}
            </span>
            {task.dueLabel && (
              <span className={cn("inline-flex items-center gap-1 font-semibold", task.overdue ? "text-rose-600" : "text-slate-500")}>
                <Clock size={12} weight="bold" /> {task.dueLabel}
              </span>
            )}
            {task.escalationLevel > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                <Warning size={12} weight="bold" /> L{task.escalationLevel}
              </span>
            )}
          </div>

          {task.blockedReason && (
            <p className="mb-3 rounded-lg border border-rose-100 bg-rose-50/60 px-2.5 py-1.5 text-xs text-rose-800">
              <span className="font-bold">Blocker:</span> {task.blockedReason}
            </p>
          )}

          <TaskOpsControls taskId={task._id} status={task.status} assignedTo={task.assignedTo} overdue={task.overdue} onChanged={onChanged} />
        </div>
      </div>
    </div>
  );
}
