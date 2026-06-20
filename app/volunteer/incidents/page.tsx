"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  WarningOctagon,
  Warning,
  CircleNotch,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Robot,
  ClipboardText,
  ChatCircleText,
  PaperPlaneTilt,
  SpinnerGap,
  Lightning,
  ShieldCheck,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { ActivityTimeline } from "@/components/operations/activity-timeline";

interface VolunteerIncident {
  id: string;
  activityKey: string;
  title: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low" | string;
  status: string;
  description: string;
  location: string;
  reportedAt: string | null;
  source: string;
  impactPoints: string[];
  acknowledgedByYou: boolean;
  acknowledgedCount: number;
  acknowledgedNames: string[];
  relatedToYou: boolean;
  coordinationCount: number;
}

const severityConfig: Record<string, { label: string; className: string; bar: string; icon: typeof Warning }> = {
  critical: { label: "Critical", className: "bg-red-100 text-red-700 border-red-200", bar: "bg-red-500", icon: WarningOctagon },
  high: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200", bar: "bg-orange-500", icon: Warning },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 border-amber-200", bar: "bg-amber-500", icon: Clock },
  low: { label: "Low", className: "bg-slate-100 text-slate-700 border-slate-200", bar: "bg-slate-400", icon: CircleNotch },
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  investigating: "bg-amber-100 text-amber-700 border-amber-200",
  mitigated: "bg-indigo-100 text-indigo-700 border-indigo-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

const ACTIVE_STATUSES = ["open", "investigating", "mitigated"];

function formatTime(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" });
}

export default function VolunteerIncidentsPage() {
  const user = useAuth();
  const [incidents, setIncidents] = useState<VolunteerIncident[]>([]);
  const [eventName, setEventName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/volunteer/incidents");
      const data = await res.json();
      if (data.success) {
        setIncidents(data.data as VolunteerIncident[]);
        setEventName(data.eventName);
      }
    } catch {
      /* keep whatever we have */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const acknowledge = useCallback(async (incidentId: string) => {
    // Optimistic — reconciled by the server response.
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId && !i.acknowledgedByYou
          ? {
              ...i,
              acknowledgedByYou: true,
              acknowledgedCount: i.acknowledgedCount + 1,
              acknowledgedNames: [...i.acknowledgedNames, user?.name || "You"].slice(0, 5),
            }
          : i,
      ),
    );
    try {
      await fetch(`/api/incidents/${incidentId}/acknowledge`, { method: "POST" });
    } catch {
      load(); // revert to server truth
    }
  }, [user?.name, load]);

  const stats = useMemo(
    () => ({
      active: incidents.filter((i) => ACTIVE_STATUSES.includes(i.status)).length,
      critical: incidents.filter((i) => ACTIVE_STATUSES.includes(i.status) && (i.severity === "critical" || i.severity === "high")).length,
      acknowledged: incidents.filter((i) => i.acknowledgedByYou).length,
      resolved: incidents.filter((i) => i.status === "resolved" || i.status === "closed").length,
    }),
    [incidents],
  );

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <WarningOctagon className="text-indigo-600" />
          Incident Operations
        </h1>
        <p className="text-slate-500">
          {eventName ? `Live operational incidents for ${eventName}.` : "Live operational incidents requiring field awareness."}
        </p>
      </header>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatCard label="Active" value={stats.active} tone="blue" icon={<Warning className="h-4 w-4 text-blue-600" weight="bold" />} />
        <StatCard label="Urgent" value={stats.critical} tone="rose" icon={<Lightning className="h-4 w-4 text-rose-600" weight="bold" />} />
        <StatCard label="You acknowledged" value={stats.acknowledged} tone="indigo" icon={<ShieldCheck className="h-4 w-4 text-indigo-600" weight="bold" />} />
        <StatCard label="Resolved" value={stats.resolved} tone="emerald" icon={<CheckCircle className="h-4 w-4 text-emerald-600" weight="bold" />} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <CircleNotch size={40} className="animate-spin mb-3" />
          <p className="text-sm font-medium">Loading incidents…</p>
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-dashed bg-slate-50/50 py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <ShieldCheck size={32} className="text-emerald-400" weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">All clear</h3>
            <p className="text-sm text-slate-500 max-w-[300px] mt-2">
              No operational incidents are active right now. New incidents reported by organizers or Hermes will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {incidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} onAcknowledge={acknowledge} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: React.ReactNode }) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50/50 border-blue-100 text-blue-900",
    rose: "bg-rose-50/50 border-rose-100 text-rose-900",
    indigo: "bg-indigo-50/50 border-indigo-100 text-indigo-900",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-900",
  };
  return (
    <Card className={cn("shadow-sm", tones[tone])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function IncidentCard({
  incident,
  onAcknowledge,
  user,
}: {
  incident: VolunteerIncident;
  onAcknowledge: (id: string) => void;
  user: ReturnType<typeof useAuth>;
}) {
  const sev = severityConfig[incident.severity] ?? severityConfig.medium;
  const SevIcon = sev.icon;
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden border-slate-200 transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex">
          <div className={cn("w-1.5 shrink-0", sev.bar)} />
          <div className="flex-1 p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{incident.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {incident.relatedToYou && (
                    <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
                      <ClipboardText size={12} className="mr-1" weight="bold" />
                      Assigned to you
                    </Badge>
                  )}
                  {incident.source === "hermes" && (
                    <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">
                      <Robot size={12} className="mr-1" weight="bold" />
                      Hermes
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("capitalize font-semibold", sev.className)}>
                  <SevIcon size={14} className="mr-1" weight="bold" />
                  {sev.label}
                </Badge>
                <Badge variant="outline" className={cn("capitalize font-semibold", statusColors[incident.status])}>
                  {incident.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            {incident.description && (
              <p className="mb-4 text-sm leading-relaxed text-slate-600">{incident.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {incident.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400" weight="bold" />
                  <span>{incident.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-slate-400" weight="bold" />
                <span>{formatTime(incident.reportedAt)}</span>
              </div>
              {incident.acknowledgedCount > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <ShieldCheck size={16} weight="bold" />
                  <span className="font-medium">
                    {incident.acknowledgedCount} acknowledged
                    {incident.acknowledgedNames.length > 0 && ` · ${incident.acknowledgedNames.join(", ")}`}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              {incident.acknowledgedByYou ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                  <CheckCircle size={16} weight="fill" />
                  Acknowledged
                </span>
              ) : (
                <button
                  onClick={() => onAcknowledge(incident.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500"
                >
                  <ShieldCheck size={16} weight="bold" />
                  Acknowledge
                </button>
              )}

              <button
                onClick={() => setOpen((s) => !s)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition",
                  open
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600",
                )}
              >
                <ChatCircleText size={16} weight="bold" />
                {open ? "Hide details" : "View & coordinate"}
                {incident.coordinationCount > 0 && !open && (
                  <span className="rounded-full bg-indigo-100 px-1.5 text-xs text-indigo-700">{incident.coordinationCount}</span>
                )}
              </button>
            </div>

            {open && <IncidentDetail incident={incident} user={user} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IncidentDetail({ incident, user }: { incident: VolunteerIncident; user: ReturnType<typeof useAuth> }) {
  return (
    <div className="mt-4 space-y-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
      {incident.impactPoints.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Field Briefing</h4>
          <ul className="space-y-1.5">
            {incident.impactPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <Warning size={14} className="mt-0.5 shrink-0 text-amber-500" weight="bold" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Operations Activity</h4>
        <p className="mb-3 text-xs text-slate-400">Real-time actions by organizers and Hermes on this incident.</p>
        <ActivityTimeline target={`incident:${incident.activityKey}`} />
      </div>

      <div>
        <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Coordination</h4>
        <CoordinationThread incidentId={incident.id} user={user} />
      </div>
    </div>
  );
}

interface IncidentMsg {
  _id: string;
  content: string;
  sender: { id: string; name: string; role: string };
  createdAt: string;
}

function CoordinationThread({ incidentId, user }: { incidentId: string; user: ReturnType<typeof useAuth> }) {
  const [messages, setMessages] = useState<IncidentMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { id: user?.email || "volunteer", name: user?.name || "Volunteer", role: user?.role || "volunteer" },
          content,
        }),
      });
      const created = await res.json();
      if (created && created._id) setMessages((prev) => [...prev, created]);
      setDraft("");
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-3 max-h-56 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-xs font-medium text-slate-400">
            <SpinnerGap size={16} className="animate-spin" /> Loading updates…
          </div>
        ) : messages.length === 0 ? (
          <p className="py-3 text-center text-xs font-medium text-slate-400">
            No coordination updates yet. Post a field update for the operations team.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender?.name === user?.name;
            const isOrganizer = m.sender?.role === "organizer";
            return (
              <div key={m._id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    mine
                      ? "bg-indigo-600 text-white"
                      : isOrganizer
                        ? "border border-violet-200 bg-violet-50 text-violet-900"
                        : "border border-slate-200 bg-white text-slate-700",
                  )}
                >
                  {m.content}
                </div>
                <span className="mt-1 px-1 text-[10px] font-medium text-slate-400">
                  {m.sender?.name}
                  {m.sender?.role ? ` · ${m.sender.role}` : ""}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Post a field update…"
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? <SpinnerGap size={16} className="animate-spin" /> : <PaperPlaneTilt size={16} weight="fill" />}
        </button>
      </form>
    </div>
  );
}
