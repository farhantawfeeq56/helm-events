"use client";

import { useEffect, useState } from "react";
import {
  Timer,
  ShieldCheck,
  CheckCircle,
  Robot,
  CircleNotch,
  ChartBar,
  Trophy,
  UserGear,
  WarningOctagon,
  Clock,
  Lightning,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ResolutionAnalytics } from "@/lib/services/analytics-service";

function fmtMins(n: number): string {
  if (!n || n <= 0) return "—";
  if (n < 60) return `${Math.round(n)}m`;
  const h = Math.floor(n / 60);
  const m = Math.round(n % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function AnalyticsExperience() {
  const [data, setData] = useState<ResolutionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics/resolution");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        /* keep null */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <CircleNotch size={40} className="animate-spin mb-3" />
        <p className="text-sm font-medium">Crunching operational data…</p>
      </div>
    );
  }

  if (!data || !data.hasData) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
        <ChartBar size={36} className="mx-auto mb-3 text-slate-300" weight="duotone" />
        <h3 className="text-lg font-semibold text-slate-900">No analytics yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Resolve incidents and complete tasks — analytics are derived from real activity and will populate here.
        </p>
      </div>
    );
  }

  const { incidents, tasks, volunteers, organizers, hermes } = data;

  return (
    <div className="space-y-10">
      {/* Headline KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Timer weight="bold" />} tone="indigo" label="Mean Time to Resolve" value={fmtMins(incidents.mttrMins)} sub={`median ${fmtMins(incidents.medianResolveMins)}`} />
        <Kpi icon={<ShieldCheck weight="bold" />} tone="emerald" label="Incident Resolution" value={`${incidents.resolutionRate}%`} sub={`${incidents.resolved}/${incidents.total} resolved`} />
        <Kpi icon={<CheckCircle weight="bold" />} tone="sky" label="Avg Task Execution" value={fmtMins(tasks.avgCompletionMins)} sub={`${tasks.completionRate}% completion`} />
        <Kpi icon={<Robot weight="bold" />} tone="violet" label="Hermes Detection" value={`${hermes.detectionSharePct}%`} sub={`${hermes.incidentsDetected} of ${incidents.total} incidents`} />
      </div>

      {/* Incident resolution performance */}
      <Section icon={<WarningOctagon weight="bold" />} title="Incident Resolution Performance">
        <div className="grid gap-4 sm:grid-cols-4">
          <MiniStat label="Mean Resolve" value={fmtMins(incidents.mttrMins)} />
          <MiniStat label="Median Resolve" value={fmtMins(incidents.medianResolveMins)} />
          <MiniStat label="Avg Time to Ack" value={fmtMins(incidents.avgAckMins)} />
          <MiniStat label="Acknowledged" value={`${incidents.acknowledgedRate}%`} />
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <BarGroup title="Mean Time to Resolve, by Severity" rows={incidents.bySeverity.map((s) => ({ label: s.key, value: s.mttrMins, display: fmtMins(s.mttrMins), sub: `${s.resolved}/${s.total} resolved` }))} color={severityColor} unitMax />
          <BarGroup title="Resolution, by Incident Type" rows={incidents.byType.map((s) => ({ label: s.key, value: s.total ? Math.round((s.resolved / s.total) * 100) : 0, display: `${s.total ? Math.round((s.resolved / s.total) * 100) : 0}%`, sub: `${s.resolved}/${s.total} · ${fmtMins(s.mttrMins)}` }))} max={100} />
        </div>
      </Section>

      {/* Task execution trends */}
      <Section icon={<CheckCircle weight="bold" />} title="Task Execution Trends">
        <div className="grid gap-4 sm:grid-cols-4">
          <MiniStat label="Completed" value={`${tasks.completed}/${tasks.total}`} />
          <MiniStat label="Completion Rate" value={`${tasks.completionRate}%`} />
          <MiniStat label="Avg Execution" value={fmtMins(tasks.avgCompletionMins)} />
          <MiniStat label="Median" value={fmtMins(tasks.medianCompletionMins)} />
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <Throughput data={tasks.throughput} />
          <BarGroup
            title="Completion by Priority"
            rows={tasks.byPriority
              .sort((a, b) => priorityRank(a.key) - priorityRank(b.key))
              .map((p) => ({ label: p.key, value: p.total ? Math.round((p.completed / p.total) * 100) : 0, display: `${p.completed}/${p.total}`, sub: `${p.total ? Math.round((p.completed / p.total) * 100) : 0}% done` }))}
            max={100}
            color={(k) => (k === "high" ? "#e11d48" : k === "medium" ? "#d97706" : "#64748b")}
          />
        </div>
      </Section>

      {/* Volunteer contribution */}
      <Section icon={<Trophy weight="bold" />} title="Volunteer Contribution">
        {volunteers.length === 0 ? (
          <Empty>No volunteer contributions recorded yet.</Empty>
        ) : (
          <Leaderboard
            rows={volunteers.slice(0, 12)}
            maxScore={volunteers[0]?.score || 1}
            columns={[
              { head: "Done", get: (v) => v.tasksCompleted, icon: <CheckCircle size={12} weight="bold" /> },
              { head: "Avg", get: (v) => fmtMins(v.avgTaskMins), icon: <Clock size={12} weight="bold" /> },
              { head: "Acks", get: (v) => v.acknowledgements, icon: <ShieldCheck size={12} weight="bold" /> },
              { head: "Msgs", get: (v) => v.messages, icon: <Lightning size={12} weight="bold" /> },
              { head: "Shifts", get: (v) => v.shifts, icon: <Timer size={12} weight="bold" /> },
            ]}
            subtitle={(v) => v.role}
          />
        )}
      </Section>

      {/* Organizer workload */}
      <Section icon={<UserGear weight="bold" />} title="Organizer Workload">
        {organizers.length === 0 ? (
          <Empty>No organizer activity recorded yet.</Empty>
        ) : (
          <Leaderboard
            rows={organizers.slice(0, 12)}
            maxScore={organizers[0]?.score || 1}
            barTone="#7c3aed"
            columns={[
              { head: "Plans", get: (o) => o.plansApproved, icon: <ShieldCheck size={12} weight="bold" /> },
              { head: "Dispatched", get: (o) => o.tasksDispatched, icon: <CheckCircle size={12} weight="bold" /> },
              { head: "Actions", get: (o) => o.actions, icon: <Lightning size={12} weight="bold" /> },
            ]}
          />
        )}
      </Section>

      {/* Hermes effectiveness */}
      <Section icon={<Robot weight="bold" />} title="Hermes Effectiveness">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-black text-violet-700">{hermes.detectionSharePct}%</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-widest text-violet-400">Detection Share</div>
              <p className="mt-1 text-xs text-slate-500">{hermes.incidentsDetected} incidents surfaced by Hermes</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:col-span-2">
              <MiniStat label="Hermes Resolution" value={`${hermes.resolutionRate}%`} hint={`vs ${hermes.manualResolutionRate}% manual`} />
              <MiniStat label="Hermes MTTR" value={fmtMins(hermes.mttrMins)} />
              <MiniStat label="Acknowledged" value={`${hermes.acknowledgedRate}%`} />
              <MiniStat label="Agent Actions" value={`${hermes.agentActions}`} />
              <MiniStat label="Plans Acted On" value={`${hermes.plansFromHermes}`} />
              <MiniStat label="Tasks Dispatched" value={`${hermes.tasksFromHermes}`} />
            </div>
          </div>
        </div>
      </Section>

      <p className="text-xs text-slate-400">
        Generated {new Date(data.generatedAt).toLocaleString()} from live records — incidents, tasks, shifts, acknowledgements, coordination, and the activity log.
      </p>
    </div>
  );
}

// ── Presentational primitives ────────────────────────────────────────────────

const TONES: Record<string, { text: string; bg: string }> = {
  indigo: { text: "text-indigo-600", bg: "bg-indigo-50" },
  emerald: { text: "text-emerald-600", bg: "bg-emerald-50" },
  sky: { text: "text-sky-600", bg: "bg-sky-50" },
  violet: { text: "text-violet-600", bg: "bg-violet-50" },
};

function Kpi({ icon, tone, label, value, sub }: { icon: React.ReactNode; tone: keyof typeof TONES; label: string; value: string; sub?: string }) {
  const t = TONES[tone];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", t.bg, t.text)}>{icon}</span>
      </div>
      <div className="text-3xl font-black text-slate-900">{value}</div>
      {sub && <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">{icon}</span>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MiniStat({ label, value, sub, hint }: { label: string; value: string; sub?: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
      {(sub || hint) && <p className="mt-0.5 text-xs font-medium text-slate-400">{sub || hint}</p>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-400">{children}</div>;
}

interface BarRow {
  label: string;
  value: number;
  display: string;
  sub?: string;
}

function severityColor(k: string): string {
  return k === "critical" ? "#dc2626" : k === "high" ? "#ea580c" : k === "medium" ? "#d97706" : "#3b82f6";
}
function priorityRank(k: string): number {
  return k === "high" ? 0 : k === "medium" ? 1 : 2;
}

function BarGroup({ title, rows, color, max, unitMax }: { title: string; rows: BarRow[]; color?: (k: string) => string; max?: number; unitMax?: boolean }) {
  const computedMax = max ?? (unitMax ? Math.max(1, ...rows.map((r) => r.value)) : 100);
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h4>
      <div className="space-y-3">
        {rows.length === 0 && <Empty>No data.</Empty>}
        {rows.map((r) => {
          const w = Math.min(100, (r.value / computedMax) * 100);
          const c = color ? color(r.label) : "#4f46e5";
          return (
            <div key={r.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold capitalize text-slate-700">{r.label}</span>
                <span className="font-bold text-slate-900">
                  {r.display}
                  {r.sub && <span className="ml-1 font-medium text-slate-400">· {r.sub}</span>}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-all" style={{ width: `${w}%`, backgroundColor: c }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Throughput({ data }: { data: Array<{ day: string; created: number; completed: number }> }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.created, d.completed)));
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Task Throughput (7 days)</h4>
      <div className="flex items-end justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4" style={{ height: 160 }}>
        {data.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
            <div className="flex w-full items-end justify-center gap-0.5" style={{ height: "100%" }}>
              <div className="w-2 rounded-t bg-indigo-400" style={{ height: `${(d.created / max) * 100}%` }} title={`${d.created} created`} />
              <div className="w-2 rounded-t bg-emerald-500" style={{ height: `${(d.completed / max) * 100}%` }} title={`${d.completed} completed`} />
            </div>
            <span className="text-[9px] font-medium text-slate-400">{d.day.slice(5)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-4 text-[10px] font-medium text-slate-400">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-indigo-400" />Created</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" />Completed</span>
      </div>
    </div>
  );
}

interface LeaderColumn<T> {
  head: string;
  get: (row: T) => React.ReactNode;
  icon?: React.ReactNode;
}

function Leaderboard<T extends { name: string; score: number }>({
  rows,
  maxScore,
  columns,
  subtitle,
  barTone = "#4f46e5",
}: {
  rows: T[];
  maxScore: number;
  columns: LeaderColumn<T>[];
  subtitle?: (row: T) => string;
  barTone?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Name</th>
            {columns.map((c) => (
              <th key={c.head} className="px-3 py-2 text-right">{c.head}</th>
            ))}
            <th className="px-4 py-2 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
              <td className="px-4 py-2.5">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-black", i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-200 text-slate-700" : i === 2 ? "bg-orange-100 text-orange-700" : "text-slate-400")}>
                  {i + 1}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <div className="font-semibold text-slate-900">{r.name}</div>
                {subtitle && <div className="text-[11px] text-slate-400">{subtitle(r)}</div>}
              </td>
              {columns.map((c) => (
                <td key={c.head} className="px-3 py-2.5 text-right font-medium text-slate-600">{c.get(r)}</td>
              ))}
              <td className="px-4 py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (r.score / maxScore) * 100)}%`, backgroundColor: barTone }} />
                  </div>
                  <span className="font-black text-slate-900">{r.score}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
