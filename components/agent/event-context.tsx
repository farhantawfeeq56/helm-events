"use client";

import { Calendar, MapPin, Clock, Info } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

export function EventContext() {
  return (
    <div className="p-4 border-b border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Event Context</h2>
        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase text-[10px]">Live Now</Badge>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Info size={18} weight="duotone" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Event</span>
            <span className="text-sm font-bold text-slate-900 leading-tight">Global Tech Summit 2024</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <MapPin size={18} weight="duotone" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Venue Context</span>
            <span className="text-sm font-bold text-slate-900 leading-tight">Moscone Center, South Hall</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Clock size={18} weight="duotone" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Operational Time</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">10:42 AM</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Day 2 of 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
