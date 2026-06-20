"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heartbeat,
  WarningOctagon,
  WarningCircle,
  CheckCircle,
  ShieldCheck,
  ListChecks,
  UsersThree,
  Timer,
  Prohibit,
  ArrowUpRight,
  CircleNotch,
  ArrowClockwise,
  Pulse,
  Siren,
  Clock,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { EventHealth, HealthAttentionItem, RiskSeverity } from "@/types/data-hub";

const POLL_MS = 30_000;

const SEVERITY: Record<RiskSeverity, { text: string; bg: string; border: string; dot: string; label: string }> = {
  critical: { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500", label: "Critical" },
  high: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", label: "High" },
  medium: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", label: "Medium" },
  low: { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", dot: "bg-slate-400", label: "Low" },
};

const INCIDENT_SEV: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700 border-rose-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

function toneForScore(v: number): { text: string; ring: string; chip: string } {
  if (v >= 85) return { text: "text-emerald-600", ring: "#059669", chip: "bg-emerald-100 text-emerald-700" };
  if (v >= 70) return { text: "text-lime-600", ring: "#65a30d", chip: "bg-lime-100 text-lime-700" };
  if (v >= 50) return { text: "text-amber-600", ring: "#d97706", chip: "bg-amber-100 text-amber-700" };
  if (v >= 30) return { text: "text-orange-600", ring: "#ea580c", chip: "bg-orange-100 text-orange-700" };
  return { text: "text-rose-600", ring: "#e11d48", chip: "bg-rose-100 text-rose-700" };
}

function ago(iso: string | null, nowTick: number): string {
  if (!iso) return "";
  const s = Math.max(0, Math.round((nowTick - new Date(iso).getTime()) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  return `${m}m ago`;
}

function fmtAge(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function HealthDashboard() {
  const [health, setHealth] = useState<EventHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(0); // seeded by the 1s ticker effect (kept out of render to stay pure)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/operations/health", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setHealth(json.data as EventHealth | null);
        setFetchedAt(new Date().toISOString());
      }
    } catch {
      /* keep prior state — transient network blips shouldn't blank the board */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    timer.current = setInterval(load, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [load]);

  // Lightweight 1s ticker just for the "updated Ns ago" label.
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (loading && !health) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <CircleNotch size={40} className="mb-3 animate-spin" />
        <p className="text-sm font-medium">Assessing event health…</p>
      </div>
    );
  }

  if (!health || !health.hasData) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
        <Heartbeat size={36} className="mx-auto mb-3 text-slate-300" weight="duotone" />
        <h3 className="text-lg font-semibold text-slate-900">No active event to assess</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Once an event has incidents, tasks, and volunteers, its live operational health appears here.
        </p>
      </div>
    );
  }

  const tone = toneForScore(health.score);

  return (
    <div className="space-y-6">
      {/* Header / live status */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-indigo-600">Operational Health</h2>
          <p className="text-slate-500">{health.eventName ? `Live state of ${health.eventName}` : "Live state of the active event"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Updated {ago(fetchedAt, nowTick)}
          </span>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
          >
            {refreshing ? <CircleNotch size={14} className="animate-spin" /> : <ArrowClockwise size={14} weight="bold" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Hero: score + components */}
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <HeroScore health={health} tone={tone} />
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {health.components.map((c) => {
            const ct = toneForScore(c.score);
            return (
              <div key={c.key} className="flex flex-col justify-between rounded-2xl bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{c.label}</span>
                  <span className={cn("text-sm font-black", ct.text)}>{c.score}</span>
                </div>
                <div className="my-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(2, c.score)}%`, backgroundColor: ct.ring }} />
                </div>
                <p className="text-[11px] font-medium text-slate-400">{c.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Needs attention */}
      <AttentionPanel items={health.attention} />

      {/* Section grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <IncidentsCard health={health} />
        <TaskProgressCard health={health} />
        <WorkforceCard health={health} />
        <ResponseCard health={health} />
      </div>
    </div>
  );
}

function HeroScore({ health, tone }: { health: EventHealth; tone: ReturnType<typeof toneForScore> }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, health.score)) / 100) * circ;
  return (
    <div className="flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 124 124" className="h-36 w-36 -rotate-90">
          <circle cx="62" cy="62" r={r} fill="none" stroke="#e2e8f0" strokeWidth="11" />
          <circle cx="62" cy="62" r={r} fill="none" stroke={tone.ring} strokeWidth="11" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-black", tone.text)}>{health.score}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Health</span>
        </div>
        <div className={cn("absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-black shadow-sm", tone.chip)}>
          {health.grade}
        </div>
      </div>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <Heartbeat size={20} weight="bold" className={tone.text} />
          <h3 className="text-xl font-bold text-slate-900">{health.status}</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-500">
          A live composite of task execution, incident load, staffing coverage, and response — the current operating state at a glance.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <HeroChip icon={<WarningOctagon size={13} weight="bold" />} label={`${health.incidents.active} active incidents`} tone={health.incidents.active ? "rose" : "slate"} />
          <HeroChip icon={<ListChecks size={13} weight="bold" />} label={`${health.tasks.atRisk} tasks at risk`} tone={health.tasks.atRisk ? "amber" : "slate"} />
          <HeroChip icon={<UsersThree size={13} weight="bold" />} label={`${health.workforce.onShiftNow} on duty`} tone="sky" />
        </div>
      </div>
    </div>
  );
}

function HeroChip({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: string }) {
  const tones: Record<string, string> = {
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-500",
  };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", tones[tone] || tones.slate)}>{icon}{label}</span>;
}

function AttentionPanel({ items }: { items: HealthAttentionItem[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Siren size={18} weight="bold" className="text-rose-500" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Needs Attention</h3>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", items.length ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700")}>
          {items.length || "0"}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50/60 px-4 py-5 text-emerald-700">
          <CheckCircle size={22} weight="fill" />
          <p className="text-sm font-semibold">All clear — no risks flagged on the active event right now.</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((it) => {
            const s = SEVERITY[it.severity];
            const body = (
              <div className={cn("flex h-full items-start gap-3 rounded-2xl border px-4 py-3 transition", s.border, s.bg, it.link && "hover:shadow-sm")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", s.dot)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-900">{it.title}</p>
                    {it.link && <ArrowUpRight size={13} weight="bold" className="shrink-0 text-slate-400" />}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{it.detail}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", s.text)}>{s.label}</span>
              </div>
            );
            return it.link ? <Link key={it.id} href={it.link}>{body}</Link> : <div key={it.id}>{body}</div>;
          })}
        </div>
      )}
    </div>
  );
}

function SectionCard({ icon, title, href, children }: { icon: React.ReactNode; title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">{title}</h3>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 transition hover:text-indigo-600">
          View <ArrowUpRight size={12} weight="bold" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function IncidentsCard({ health }: { health: EventHealth }) {
  const { incidents } = health;
  return (
    <SectionCard icon={<WarningOctagon size={18} weight="bold" className="text-rose-500" />} title="Open Incidents" href="/incidents">
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Stat label="Active" value={incidents.active} tone={incidents.active ? "rose" : "slate"} />
        <Stat label="Critical" value={incidents.critical} tone={incidents.critical ? "rose" : "slate"} />
        <Stat label="Unack. urgent" value={incidents.unacknowledgedUrgent} tone={incidents.unacknowledgedUrgent ? "orange" : "slate"} />
      </div>
      {incidents.list.length === 0 ? (
        <EmptyRow icon={<ShieldCheck size={18} weight="bold" />} text="No open incidents." />
      ) : (
        <div className="space-y-2">
          {incidents.list.slice(0, 5).map((i) => (
            <div key={i._id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
              <span className={cn("shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-black uppercase", INCIDENT_SEV[i.severity] || INCIDENT_SEV.low)}>{i.severity}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{i.title}</p>
                <p className="text-[11px] font-medium capitalize text-slate-400">{i.status} · {fmtAge(i.ageMins)} old</p>
              </div>
              {i.acknowledged ? (
                <span title="Acknowledged" className="shrink-0 text-emerald-500"><CheckCircle size={16} weight="fill" /></span>
              ) : (
                <span title="Unacknowledged" className="shrink-0 text-orange-400"><WarningCircle size={16} weight="fill" /></span>
              )}
            </div>
          ))}
          {incidents.list.length > 5 && <p className="pt-1 text-center text-xs font-medium text-slate-400">+{incidents.list.length - 5} more active</p>}
        </div>
      )}
    </SectionCard>
  );
}

function TaskProgressCard({ health }: { health: EventHealth }) {
  const { tasks } = health;
  const total = Math.max(1, tasks.total);
  const seg = (n: number) => `${(n / total) * 100}%`;
  return (
    <SectionCard icon={<ListChecks size={18} weight="bold" className="text-indigo-500" />} title="Task Progress" href="/operations/task-operations">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <span className="text-3xl font-black text-slate-900">{tasks.completionRate}</span>
          <span className="text-lg font-bold text-slate-400">%</span>
          <p className="text-xs font-medium text-slate-400">{tasks.completed}/{tasks.total} completed</p>
        </div>
        <div className="text-right text-xs font-semibold text-slate-500">
          <p>{tasks.inProgress} in progress</p>
          <p>{tasks.open} open</p>
        </div>
      </div>
      <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full bg-emerald-500" style={{ width: seg(tasks.completed) }} title="Completed" />
        <div className="h-full bg-amber-400" style={{ width: seg(tasks.inProgress) }} title="In progress" />
        <div className="h-full bg-blue-400" style={{ width: seg(tasks.open) }} title="Open" />
        <div className="h-full bg-rose-400" style={{ width: seg(tasks.blocked) }} title="Blocked" />
        <div className="h-full bg-purple-500" style={{ width: seg(tasks.escalated) }} title="Escalated" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <RiskChip icon={<Timer size={13} weight="bold" />} label="Overdue" value={tasks.overdue} tone={tasks.overdue ? "rose" : "slate"} />
        <RiskChip icon={<Prohibit size={13} weight="bold" />} label="Blocked" value={tasks.blocked} tone={tasks.blocked ? "rose" : "slate"} />
        <RiskChip icon={<WarningCircle size={13} weight="bold" />} label="Escalated" value={tasks.escalated} tone={tasks.escalated ? "orange" : "slate"} />
        <RiskChip icon={<UsersThree size={13} weight="bold" />} label="Unassigned" value={tasks.unassigned} tone={tasks.unassigned ? "amber" : "slate"} />
      </div>
    </SectionCard>
  );
}

function WorkforceCard({ health }: { health: EventHealth }) {
  const { workforce } = health;
  return (
    <SectionCard icon={<UsersThree size={18} weight="bold" className="text-sky-500" />} title="Volunteer Workload" href="/operations?collection=volunteers">
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Stat label="On duty now" value={workforce.onShiftNow} tone="sky" />
        <Stat label="Active" value={workforce.active} tone="slate" />
        <Stat label="With work" value={workforce.withActiveWork} tone="slate" />
      </div>
      {workforce.load.length === 0 ? (
        <EmptyRow icon={<UsersThree size={18} weight="bold" />} text="No active task assignments." />
      ) : (
        <div className="space-y-1.5">
          {workforce.load.slice(0, 5).map((v) => (
            <div key={v.name} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50">
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black", v.onShift ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500")}>
                {v.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{v.name}</p>
                {(v.overdue > 0 || v.blocked > 0) && (
                  <p className="text-[11px] font-medium text-rose-500">{[v.overdue ? `${v.overdue} overdue` : "", v.blocked ? `${v.blocked} blocked` : ""].filter(Boolean).join(" · ")}</p>
                )}
              </div>
              {v.overloaded && <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black uppercase text-orange-700">Heavy</span>}
              <span className="shrink-0 text-sm font-black text-slate-700">{v.activeTasks}</span>
            </div>
          ))}
          {workforce.unassignedActiveTasks > 0 && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs font-semibold text-amber-700">
              <WarningCircle size={14} weight="bold" />
              {workforce.unassignedActiveTasks} active task{workforce.unassignedActiveTasks === 1 ? "" : "s"} with no owner
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function ResponseCard({ health }: { health: EventHealth }) {
  const { response } = health;
  return (
    <SectionCard icon={<Pulse size={18} weight="bold" className="text-emerald-500" />} title="Response Performance" href="/operations/analytics">
      <div className="grid grid-cols-2 gap-3">
        <KPI icon={<ShieldCheck size={15} weight="bold" />} label="Incident resolution" value={`${response.incidentResolutionRate}%`} />
        <KPI icon={<Timer size={15} weight="bold" />} label="Mean time to resolve" value={response.mttrMins ? `${response.mttrMins}m` : "—"} />
        <KPI icon={<CheckCircle size={15} weight="bold" />} label="Acknowledged rate" value={`${response.acknowledgedRate}%`} />
        <KPI icon={<Clock size={15} weight="bold" />} label="Avg ack time" value={response.avgAckMins ? `${response.avgAckMins}m` : "—"} />
        <KPI icon={<ListChecks size={15} weight="bold" />} label="Task completion" value={`${response.taskCompletionRate}%`} />
        <KPI icon={<Pulse size={15} weight="bold" />} label="Actions / last hr" value={`${response.actionsLastHour}`} />
      </div>
    </SectionCard>
  );
}

const STAT_TONES: Record<string, string> = {
  rose: "text-rose-600",
  orange: "text-orange-600",
  amber: "text-amber-600",
  sky: "text-sky-600",
  slate: "text-slate-900",
};

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl bg-slate-50/70 px-3 py-2 text-center">
      <div className={cn("text-2xl font-black", STAT_TONES[tone] || STAT_TONES.slate)}>{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}

function RiskChip({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    rose: "text-rose-600 bg-rose-50",
    orange: "text-orange-600 bg-orange-50",
    amber: "text-amber-600 bg-amber-50",
    slate: "text-slate-400 bg-slate-50",
  };
  return (
    <div className={cn("flex flex-col items-center gap-0.5 rounded-xl py-2", tones[tone] || tones.slate)}>
      <span className="flex items-center gap-1 text-base font-black">{icon}{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</span>
    </div>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/70 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function EmptyRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50/60 px-4 py-6 text-slate-400">
      {icon}
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
