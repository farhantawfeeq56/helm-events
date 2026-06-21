"use client";

import { Info } from "@phosphor-icons/react";

interface SituationProps {
  situation: string;
}

export function Situation({ situation }: SituationProps) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Info size={18} weight="bold" />
        </div>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Current Situation</h2>
      </div>
      <div className="rounded-3xl border-2 border-slate-900 bg-white p-5 sm:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <p className="text-2xl font-bold text-slate-900 leading-snug">
          {situation}
        </p>
        <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-6">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
            ))}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Assigned to Incident Response Team Alpha
          </p>
        </div>
      </div>
    </section>
  );
}
