"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Gauge,
  CheckCircle,
  ShieldCheck,
  WarningOctagon,
  Timer,
  UsersThree,
  Robot,
  Lightning,
  CircleNotch,
  Camera,
  TrendUp,
  TrendDown,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";
import type { MetricValues, MetricSnapshot } from "@/types/data-hub";

const RANGES = ["1h", "6h", "24h", "7d"] as const;
type Range = (typeof RANGES)[number];

interface MetricsResponse {
  success: boolean;
  data?: null;
  eventName?: string | null;
  current?: MetricValues;
  previous?: MetricValues | null;
  previousAt?: string | null;
  capturedAt?: string;
}

export function MetricsOverview() {
  const [current, setCurrent] = useState<MetricValues | null>(null);
  const [previous, setPrevious] = useState<MetricValues | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [history, setHistory] = useState<MetricSnapshot[]>([]);
  const [range, setRange] = useState<Range>("24h");
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [mRes, hRes] = await Promise.all([
        fetch("/api/metrics"),
        fetch(`/api/metrics/history?range=${range}`),
      ]);
      const m: MetricsResponse = await mRes.json();
      const h = await hRes.json();
      if (m.success && m.current) {
        setCurrent(m.current);
        setPrevious(m.previous || null);
        setEventName(m.eventName || null);
      } else {
        setCurrent(null);
      }
      if (h.success) setHistory(h.data as MetricSnapshot[]);
    } catch {
      /* keep prior state */
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const capture = useCallback(async () => {
    setCapturing(true);
    try {
      await fetch("/api/metrics/snapshot", { method: "POST" });
      await load();
    } finally {
      setCapturing(false);
    }
  }, [load]);

  // Build sparkline series from the historical snapshots.
  const series = useMemo(() => {
    const pick = (k: keyof MetricValues) => history.map((s) => Number(s.metrics?.[k] ?? 0));
    return {
      operationalReadiness: pick("operationalReadiness"),
      taskCompletionRate: pick("taskCompletionRate"),
      incidentResolutionRate: pick("incidentResolutionRate"),
      incidentsOpen: pick("incidentsOpen"),
      avgTaskCompletionMins: pick("avgTaskCompletionMins"),
      volunteersOnShift: pick("volunteersOnShift"),
      hermesIncidents: pick("hermesIncidents"),
      actionsLastHour: pick("actionsLastHour"),
    };
  }, [history]);

  if (loading && !current) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <CircleNotch size={40} className="animate-spin mb-3" />
        <p className="text-sm font-medium">Loading performance metrics…</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
        <Gauge size={36} className="mx-auto mb-3 text-slate-300" weight="duotone" />
        <h3 className="text-lg font-semibold text-slate-900">No metrics yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Create an event and run some operations — incidents, tasks, and Hermes activity will start generating metrics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-indigo-600">Operational Performance</h2>
          <p className="text-slate-500">{eventName ? `Live metrics for ${eventName}` : "Live operational metrics"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold transition",
                  range === r ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-indigo-600",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={capture}
            disabled={capturing}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {capturing ? <CircleNotch size={14} className="animate-spin" /> : <Camera size={14} weight="bold" />}
            Capture
          </button>
        </div>
      </div>

      {/* Headline readiness */}
      <ReadinessCard value={current.operationalReadiness} prev={previous?.operationalReadiness} series={series.operationalReadiness} />

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Task Completion"
          value={current.taskCompletionRate}
          suffix="%"
          sub={`${current.tasksCompleted}/${current.tasksTotal} done`}
          prev={previous?.taskCompletionRate}
          series={series.taskCompletionRate}
          icon={<CheckCircle weight="bold" />}
          tone="emerald"
        />
        <MetricCard
          label="Incident Resolution"
          value={current.incidentResolutionRate}
          suffix="%"
          sub={`${current.incidentsResolved}/${current.incidentsTotal} resolved`}
          prev={previous?.incidentResolutionRate}
          series={series.incidentResolutionRate}
          icon={<ShieldCheck weight="bold" />}
          tone="indigo"
        />
        <MetricCard
          label="Open Incidents"
          value={current.incidentsActive}
          sub={`${current.incidentsAcknowledged} acknowledged`}
          prev={previous?.incidentsActive}
          series={series.incidentsOpen}
          icon={<WarningOctagon weight="bold" />}
          tone="rose"
          invert
        />
        <MetricCard
          label="Avg Task Time"
          value={current.avgTaskCompletionMins}
          suffix="m"
          sub="to completion"
          prev={previous?.avgTaskCompletionMins}
          series={series.avgTaskCompletionMins}
          icon={<Timer weight="bold" />}
          tone="amber"
          invert
        />
        <MetricCard
          label="On Shift Now"
          value={current.volunteersOnShift}
          sub={`${current.volunteersActive} active · ${current.volunteersTotal} total`}
          prev={previous?.volunteersOnShift}
          series={series.volunteersOnShift}
          icon={<UsersThree weight="bold" />}
          tone="sky"
        />
        <MetricCard
          label="Active Shifts"
          value={current.shiftsActive}
          sub={`${current.shiftsTotal} scheduled`}
          icon={<Timer weight="bold" />}
          tone="violet"
        />
        <MetricCard
          label="Hermes Incidents"
          value={current.hermesIncidents}
          sub={`${current.hermesActions} agent actions`}
          series={series.hermesIncidents}
          icon={<Robot weight="bold" />}
          tone="violet"
        />
        <MetricCard
          label="Ops Throughput"
          value={current.actionsLastHour}
          sub="actions / last hour"
          series={series.actionsLastHour}
          icon={<Lightning weight="bold" />}
          tone="slate"
        />
      </div>

      <p className="text-xs text-slate-400">
        {history.length > 0
          ? `${history.length} snapshot${history.length === 1 ? "" : "s"} in this range. New snapshots are captured automatically as the operation runs.`
          : "No snapshots in this range yet — they accrue as operations run and on capture."}
      </p>
    </div>
  );
}

function Delta({ current, prev, invert }: { current: number; prev?: number; invert?: boolean }) {
  if (prev === undefined || prev === null || prev === current) return null;
  const diff = current - prev;
  const good = invert ? diff < 0 : diff > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-bold", good ? "text-emerald-600" : "text-rose-600")}>
      {diff > 0 ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
      {Math.abs(Math.round(diff * 10) / 10)}
    </span>
  );
}

const TONES: Record<string, { text: string; stroke: string }> = {
  emerald: { text: "text-emerald-600", stroke: "#059669" },
  indigo: { text: "text-indigo-600", stroke: "#4f46e5" },
  rose: { text: "text-rose-600", stroke: "#e11d48" },
  amber: { text: "text-amber-600", stroke: "#d97706" },
  sky: { text: "text-sky-600", stroke: "#0284c7" },
  violet: { text: "text-violet-600", stroke: "#7c3aed" },
  slate: { text: "text-slate-600", stroke: "#475569" },
};

function MetricCard({
  label,
  value,
  suffix,
  sub,
  prev,
  series,
  icon,
  tone,
  invert,
}: {
  label: string;
  value: number;
  suffix?: string;
  sub?: string;
  prev?: number;
  series?: number[];
  icon: React.ReactNode;
  tone: keyof typeof TONES | string;
  invert?: boolean;
}) {
  const t = TONES[tone] || TONES.slate;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <span className={t.text}>{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">{value}</span>
            {suffix && <span className="text-lg font-bold text-slate-400">{suffix}</span>}
            <Delta current={value} prev={prev} invert={invert} />
          </div>
          {sub && <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>}
        </div>
        {series && series.length > 1 && <Sparkline data={series} color={t.stroke} width={84} height={34} />}
      </div>
    </div>
  );
}

function ReadinessCard({ value, prev, series }: { value: number; prev?: number; series: number[] }) {
  const tone = value >= 80 ? "emerald" : value >= 55 ? "amber" : "rose";
  const ring = tone === "emerald" ? "#059669" : tone === "amber" ? "#d97706" : "#e11d48";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:p-8">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900">{value}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Readiness</span>
        </div>
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
          <Gauge size={20} className="text-indigo-600" weight="bold" />
          <h3 className="text-lg font-bold text-slate-900">Operational Readiness</h3>
          <Delta current={value} prev={prev} />
        </div>
        <p className="mb-4 text-sm text-slate-500">
          A composite of task completion, incident resolution, and current incident load — how the operation is holding up right now.
        </p>
        {series.length > 1 && <Sparkline data={series} color={ring} width={260} height={44} strokeWidth={2.5} />}
      </div>
    </div>
  );
}
