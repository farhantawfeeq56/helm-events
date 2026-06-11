"use client";

import { Chats } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CommunicationPlan } from "@/lib/hermes";

interface CommunicationsProps {
  communications: CommunicationPlan[];
}

export function Communications({ communications }: CommunicationsProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Chats size={18} weight="bold" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Communication Plan</h2>
      </div>
      <div className="space-y-4">
        {communications.length > 0 ? (
          communications.map((comm) => (
            <div key={comm.id} className="flex gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                comm.status === "sent" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
              )}>
                <Chats size={24} weight="duotone" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-900">{comm.channel}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">To: {comm.audience}</span>
                  <Badge variant="outline" className={cn(
                    "ml-auto text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
                    comm.status === "sent" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-slate-200 text-slate-400"
                  )}>
                    {comm.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                  &ldquo;{comm.message}&rdquo;
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center bg-white/50">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No communications dispatched yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
