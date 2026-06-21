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

const SEVERITY: Record<RiskSeverity, { text: string; bg: string; border: string; bar: string; label: string }> = {
  critical: { text: "text-rose-700", bg: "bg-rose-50/70", border: "border-rose-200", bar: "bg-rose-500", label: "Critical" },
  high: { text: "text-orange-700", bg: "bg-orange-50/70", border: "border-orange-200", bar: "bg-orange-500", label: "High" },
  medium: { text: "text-amber-700", bg: "bg-amber-50/70", border: "border-amber-200", bar: "bg-amber-500", label: "Medium" },
  low: { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", bar: "bg-slate-400", label: "Low" },
};

const INCIDENT_SEV: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600",
};

/** Score → color tones. `ring`/`glow` are vivid 500/400-level hex for the dark hero. */
function toneForScore(v: number): { text: string; chip: string; ring: string; glow: string } {
  if (v >= 85) return { text: "text-emerald-600", chip: "bg-emerald-100 text-emerald-700", ring: "#10b981", glow: "#34d399" };
  if (v >= 70) return { text: "text-lime-600", chip: "bg-lime-100 text-lime-700", ring: "#84cc16", glow: "#a3e635" };
  if (v >= 50) return { text: "text-amber-600", chip: "bg-amber-100 text-amber-700", ring: "#f59e0b", glow: "#fbbf24" };
  if (v >= 30) return { text: "text-orange-600", chip: "bg-orange-100 text-orange-700", ring: "#f97316", glow: "#fb923c" };
  return { text: "text-rose-600", chip: "bg-rose-100 text-rose-700", ring: "#f43f5e", glow: "#fb7185" };
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
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
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
    <div className="space-y-5">
      {/* Live toolbar */}
      <div className="flex items-center justify-end gap-3">
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
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50"
        >
          {refreshing ? <CircleNotch size={14} className="animate-spin" /> : <ArrowClockwise size={14} weight="bold" />}
          Refresh
        </button>
      </div>

      {/* Hero — the focal anchor */}
      <Reveal>
        <HeroScore health={health} tone={tone} />
      </Reveal>

      {/* Triage strip */}
      <Reveal delay={60}>
        <AttentionPanel items={health.attention} />
      </Reveal>

      {/* Detail sections */}
      <div className="grid grid-cols-1 min-w-0 gap-4 lg:grid-cols-2">
        <Reveal delay={120}><IncidentsCard health={health} /></Reveal>
        <Reveal delay={160}><TaskProgressCard health={health} /></Reveal>
        <Reveal delay={200}><WorkforceCard health={health} /></Reveal>
        <Reveal delay={240}><ResponseCard health={health} /></Reveal>
      </div>
    </div>
  );
}

/** Subtle staggered entrance; disabled under prefers-reduced-motion. */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="h-full min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HeroScore({ health, tone }: { health: EventHealth; tone: ReturnType<typeof toneForScore> }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, health.score)) / 100) * circ;
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg sm:p-7">
      {/* tone glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(420px circle at 14% 50%, ${tone.glow}1f, transparent 60%)` }}
      />
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        {/* Ring — centered on mobile, left on desktop */}
        <div className="flex justify-center lg:justify-start">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
              <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
              <circle
                cx="60" cy="60" r={r} fill="none" stroke={tone.ring} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                className="transition-all duration-700"
                style={{ filter: `drop-shadow(0 0 6px ${tone.glow}99)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tabular-nums" style={{ color: tone.glow }}>{health.score}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Health</span>
            </div>
            <div className={cn("absolute -right-1 top-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black shadow", tone.chip)}>
              {health.grade}
            </div>
          </div>
        </div>

        {/* Status + chips — centered on mobile, left on desktop */}
        <div className="min-w-0 text-center lg:text-left">
          <HeroStatus health={health} tone={tone} />
        </div>

        {/* Component meters */}
        <div className="grid w-full grid-cols-2 gap-x-5 gap-y-3 border-t border-slate-800 pt-5 lg:w-72 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {health.components.map((c) => {
            const ct = toneForScore(c.score);
            return (
              <div key={c.key} title={c.detail}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{c.label}</span>
                  <span className="text-xs font-black tabular-nums" style={{ color: ct.glow }}>{c.score}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(3, c.score)}%`, backgroundColor: ct.ring }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HeroStatus({ health, tone }: { health: EventHealth; tone: ReturnType<typeof toneForScore> }) {
  return (
    <>
      <div className="mb-1 flex items-center justify-center gap-2 lg:justify-start">
        <Heartbeat size={18} weight="fill" style={{ color: tone.glow }} />
        <span className="truncate text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {health.eventName || "Active event"}
        </span>
      </div>
      <h3 className="text-2xl font-bold tracking-tight text-white">{health.status}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-400 lg:mx-0">
        Live composite of task execution, incident load, staffing coverage, and response.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
        <HeroChip icon={<WarningOctagon size={13} weight="bold" />} label={`${health.incidents.active} active`} tone={health.incidents.active ? "rose" : "slate"} />
        <HeroChip icon={<ListChecks size={13} weight="bold" />} label={`${health.tasks.atRisk} at risk`} tone={health.tasks.atRisk ? "amber" : "slate"} />
        <HeroChip icon={<UsersThree size={13} weight="bold" />} label={`${health.workforce.onShiftNow} on duty`} tone="sky" />
      </div>
    </>
  );
}

function HeroChip({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: string }) {
  const tones: Record<string, string> = {
    rose: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/25",
    amber: "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/25",
    sky: "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/25",
    slate: "bg-slate-800 text-slate-400 ring-1 ring-inset ring-slate-700",
  };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums", tones[tone] || tones.slate)}>{icon}{label}</span>;
}

function AttentionPanel({ items }: { items: HealthAttentionItem[] }) {
  const clear = items.length === 0;
  return (
    <section className={cn("rounded-2xl border bg-white p-5 shadow-sm", clear ? "border-emerald-200" : "border-slate-200")}>
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", clear ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
            {clear ? <CheckCircle size={16} weight="bold" /> : <Siren size={16} weight="bold" />}
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Needs Attention</h3>
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-black tabular-nums", clear ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
          {items.length}
        </span>
      </div>
      {clear ? (
        <p className="text-sm font-medium text-slate-500">All clear — no risks flagged on the active event right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {items.map((it) => {
            const s = SEVERITY[it.severity];
            const body = (
              <div className={cn("flex h-full items-stretch gap-3 overflow-hidden rounded-xl border bg-white pr-3 transition", s.border, it.link && "hover:shadow-sm")}>
                <span className={cn("w-1 shrink-0", s.bar)} />
                <div className="min-w-0 flex-1 py-2.5">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{it.title}</p>
                    {it.link && <ArrowUpRight size={13} weight="bold" className="shrink-0 text-slate-300" />}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{it.detail}</p>
                </div>
                <span className={cn("my-2.5 shrink-0 self-start rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider", s.bg, s.text)}>{s.label}</span>
              </div>
            );
            return it.link ? <Link key={it.id} href={it.link} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">{body}</Link> : <div key={it.id}>{body}</div>;
          })}
        </div>
      )}
    </section>
  );
}

function SectionCard({ icon, accent, title, href, children }: { icon: React.ReactNode; accent: string; title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", accent)}>{icon}</span>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        <Link href={href} className="inline-flex items-center gap-1 rounded-md px-1 text-xs font-bold text-slate-400 transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
          View <ArrowUpRight size={12} weight="bold" />
        </Link>
      </div>
      {children}
    </section>
  );
}

/** Inline stat row — flat, divided cells (replaces nested boxed tiles). */
function StatRow({ stats }: { stats: { label: string; value: number; tone: string }[] }) {
  return (
    <div className="mb-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/40">
      {stats.map((s) => (
        <div key={s.label} className="px-2 py-2.5 text-center">
          <div className={cn("text-2xl font-black tabular-nums", STAT_TONES[s.tone] || STAT_TONES.slate)}>{s.value}</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function IncidentsCard({ health }: { health: EventHealth }) {
  const { incidents } = health;
  return (
    <SectionCard icon={<WarningOctagon size={16} weight="bold" />} accent="bg-rose-100 text-rose-600" title="Open Incidents" href="/incidents">
      <StatRow stats={[
        { label: "Active", value: incidents.active, tone: incidents.active ? "rose" : "slate" },
        { label: "Critical", value: incidents.critical, tone: incidents.critical ? "rose" : "slate" },
        { label: "Unack. urgent", value: incidents.unacknowledgedUrgent, tone: incidents.unacknowledgedUrgent ? "orange" : "slate" },
      ]} />
      {incidents.list.length === 0 ? (
        <EmptyRow icon={<ShieldCheck size={18} weight="bold" />} text="No open incidents." />
      ) : (
        <div className="space-y-1.5">
          {incidents.list.slice(0, 5).map((i) => (
            <div key={i._id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50">
              <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase", INCIDENT_SEV[i.severity] || INCIDENT_SEV.low)}>{i.severity}</span>
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

const SEG = [
  { key: "completed", color: "bg-emerald-500", label: "Done" },
  { key: "inProgress", color: "bg-amber-400", label: "In progress" },
  { key: "open", color: "bg-blue-400", label: "Open" },
  { key: "blocked", color: "bg-rose-400", label: "Blocked" },
  { key: "escalated", color: "bg-purple-500", label: "Escalated" },
] as const;

function TaskProgressCard({ health }: { health: EventHealth }) {
  const { tasks } = health;
  const total = Math.max(1, tasks.total);
  return (
    <SectionCard icon={<ListChecks size={16} weight="bold" />} accent="bg-indigo-100 text-indigo-600" title="Task Progress" href="/operations/task-operations">
      <div className="mb-3 flex items-end justify-between">
        <div className="leading-none">
          <span className="text-3xl font-black tabular-nums text-slate-900">{tasks.completionRate}</span>
          <span className="text-lg font-bold text-slate-400">%</span>
          <p className="mt-1 text-xs font-medium text-slate-400 tabular-nums">{tasks.completed}/{tasks.total} completed</p>
        </div>
        <div className="text-right text-xs font-semibold text-slate-500 tabular-nums">
          <p>{tasks.inProgress} in progress</p>
          <p>{tasks.open} open</p>
        </div>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        {SEG.map((s) => (
          <div key={s.key} className={s.color} style={{ width: `${(tasks[s.key] / total) * 100}%` }} title={`${s.label}: ${tasks[s.key]}`} />
        ))}
      </div>
      <div className="mb-4 mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {SEG.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
            <span className={cn("h-2 w-2 rounded-sm", s.color)} />{s.label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
    <SectionCard icon={<UsersThree size={16} weight="bold" />} accent="bg-sky-100 text-sky-600" title="Volunteer Workload" href="/operations?collection=volunteers">
      <StatRow stats={[
        { label: "On duty now", value: workforce.onShiftNow, tone: "sky" },
        { label: "Active", value: workforce.active, tone: "slate" },
        { label: "With work", value: workforce.withActiveWork, tone: "slate" },
      ]} />
      {workforce.load.length === 0 ? (
        <EmptyRow icon={<UsersThree size={18} weight="bold" />} text="No active task assignments." />
      ) : (
        <div className="space-y-1">
          {workforce.load.slice(0, 5).map((v) => (
            <div key={v.name} className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50">
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black", v.onShift ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500")}>
                {v.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{v.name}</p>
                {(v.overdue > 0 || v.blocked > 0) && (
                  <p className="text-[11px] font-medium text-rose-500">{[v.overdue ? `${v.overdue} overdue` : "", v.blocked ? `${v.blocked} blocked` : ""].filter(Boolean).join(" · ")}</p>
                )}
              </div>
              {v.overloaded && <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black uppercase text-orange-700">Heavy</span>}
              <span className="shrink-0 text-sm font-black tabular-nums text-slate-700">{v.activeTasks}</span>
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
  const kpis = [
    { icon: <ShieldCheck size={14} weight="bold" />, label: "Incident resolution", value: `${response.incidentResolutionRate}%` },
    { icon: <Timer size={14} weight="bold" />, label: "Mean time to resolve", value: response.mttrMins ? `${response.mttrMins}m` : "—" },
    { icon: <CheckCircle size={14} weight="bold" />, label: "Acknowledged rate", value: `${response.acknowledgedRate}%` },
    { icon: <Clock size={14} weight="bold" />, label: "Avg ack time", value: response.avgAckMins ? `${response.avgAckMins}m` : "—" },
    { icon: <ListChecks size={14} weight="bold" />, label: "Task completion", value: `${response.taskCompletionRate}%` },
    { icon: <Pulse size={14} weight="bold" />, label: "Actions / last hr", value: `${response.actionsLastHour}` },
  ];
  return (
    <SectionCard icon={<Pulse size={16} weight="bold" />} accent="bg-emerald-100 text-emerald-600" title="Response Performance" href="/operations/analytics">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-100 bg-slate-100 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white p-3">
            <div className="mb-1 flex items-center gap-1.5 text-slate-400">
              {k.icon}
              <span className="text-[10px] font-bold uppercase tracking-wide">{k.label}</span>
            </div>
            <div className="text-xl font-black tabular-nums text-slate-900">{k.value}</div>
          </div>
        ))}
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

function RiskChip({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    rose: "text-rose-600 bg-rose-50",
    orange: "text-orange-600 bg-orange-50",
    amber: "text-amber-600 bg-amber-50",
    slate: "text-slate-400 bg-slate-50",
  };
  return (
    <div className={cn("flex flex-col items-center gap-0.5 rounded-xl py-2", tones[tone] || tones.slate)}>
      <span className="flex items-center gap-1 text-base font-black tabular-nums">{icon}{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</span>
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
