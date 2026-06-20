"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Info } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

interface ActiveEvent {
  name?: string;
  venue?: string;
  city?: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/** "Day 2 of 3" while the event is running, else a short status word. */
function dayLabel(event: ActiveEvent, now: Date): string | null {
  if (!event.startDate || !event.endDate) return null;
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const DAY = 86_400_000;
  const totalDays = Math.floor((end.getTime() - start.getTime()) / DAY) + 1;
  if (now.getTime() < start.getTime()) return "Upcoming";
  if (now.getTime() > end.getTime() + DAY) return "Completed";
  const dayNum = Math.min(Math.max(Math.floor((now.getTime() - start.getTime()) / DAY) + 1, 1), totalDays);
  return `Day ${dayNum} of ${totalDays}`;
}

function formatClock(now: Date, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(now);
  } catch {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", hour12: true }).format(now);
  }
}

/**
 * The agent's right-rail context header. Reflects the real active event (latest
 * created, matching `getActiveEvent`) and a live ticking clock — no hardcoded
 * venue/time.
 */
export function EventContext() {
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/events?limit=1");
        const data = await res.json();
        if (!cancelled && data?.success && Array.isArray(data.data) && data.data[0]) {
          setEvent(data.data[0] as ActiveEvent);
        }
      } catch {
        /* leave unset — the panel renders graceful fallbacks */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const eventName = event?.name || "No active event";
  const venue =
    event?.venue && event?.city
      ? `${event.venue}, ${event.city}`
      : event?.venue || event?.city || "—";
  const day = event ? dayLabel(event, now) : null;

  return (
    <div className="p-4 border-b border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Event Context</h2>
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[10px]">
          {event?.status === "live" ? "Live Now" : event?.status || "Live"}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Info size={18} weight="duotone" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Event</span>
            <span className="text-sm font-bold text-slate-900 leading-tight">{eventName}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <MapPin size={18} weight="duotone" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Venue Context</span>
            <span className="text-sm font-bold text-slate-900 leading-tight">{venue}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Clock size={18} weight="duotone" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Operational Time</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tabular-nums">{formatClock(now, event?.timezone)}</span>
              {day && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                  {day}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
