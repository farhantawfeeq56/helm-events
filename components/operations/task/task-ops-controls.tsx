"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowsClockwise,
  Warning,
  Prohibit,
  Lifebuoy,
  CalendarPlus,
  CircleNotch,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ActionKey = "reassign" | "escalate" | "block" | "recover" | "extend";

interface Props {
  taskId: string;
  status: string;
  assignedTo?: string;
  overdue?: boolean;
  onChanged?: () => void;
  className?: string;
}

const META: Record<ActionKey, { label: string; icon: typeof Warning; tone: string }> = {
  reassign: { label: "Reassign", icon: ArrowsClockwise, tone: "text-indigo-600 hover:bg-indigo-50 border-indigo-200" },
  escalate: { label: "Escalate", icon: Warning, tone: "text-orange-600 hover:bg-orange-50 border-orange-200" },
  block: { label: "Block", icon: Prohibit, tone: "text-rose-600 hover:bg-rose-50 border-rose-200" },
  recover: { label: "Recover", icon: Lifebuoy, tone: "text-emerald-600 hover:bg-emerald-50 border-emerald-200" },
  extend: { label: "Set deadline", icon: CalendarPlus, tone: "text-sky-600 hover:bg-sky-50 border-sky-200" },
};

export function TaskOpsControls({ taskId, status, overdue, onChanged, className }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<ActionKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vols, setVols] = useState<string[]>([]);
  const [form, setForm] = useState<{ assignedTo: string; reason: string; note: string; dueAt: string }>({ assignedTo: "", reason: "", note: "", dueAt: "" });

  const terminal = status === "completed" || status === "cancelled";
  const available: ActionKey[] = [];
  if (!terminal) {
    available.push("reassign");
    if (status !== "escalated") available.push("escalate");
    if (status !== "blocked") available.push("block");
    if (status === "blocked" || status === "escalated" || overdue) available.push("recover");
    available.push("extend");
  } else {
    available.push("reassign");
  }

  const loadVols = useCallback(async () => {
    if (vols.length) return;
    try {
      const res = await fetch("/api/volunteers?limit=500");
      const data = await res.json();
      if (data.success) setVols((data.data as Array<{ fullName?: string }>).map((v) => v.fullName || "").filter(Boolean));
    } catch {
      /* datalist is optional */
    }
  }, [vols.length]);

  const openForm = (key: ActionKey) => {
    setError(null);
    setForm({ assignedTo: "", reason: "", note: "", dueAt: "" });
    setOpen(key);
    if (key === "reassign" || key === "recover") loadVols();
  };

  const submit = async (key: ActionKey) => {
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { action: key };
      if (key === "reassign") { body.assignedTo = form.assignedTo; body.reason = form.reason; }
      if (key === "escalate") body.reason = form.reason;
      if (key === "block") body.reason = form.reason;
      if (key === "recover") { if (form.assignedTo) body.assignedTo = form.assignedTo; if (form.dueAt) body.dueAt = form.dueAt; body.note = form.note; }
      if (key === "extend") { body.dueAt = form.dueAt; body.reason = form.reason; }

      const res = await fetch(`/api/tasks/${taskId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Action failed.");
        return;
      }
      setOpen(null);
      if (onChanged) onChanged();
      else router.refresh();
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {available.map((key) => {
          const m = META[key];
          const Icon = m.icon;
          return (
            <button
              key={key}
              onClick={() => (open === key ? setOpen(null) : openForm(key))}
              className={cn("inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-bold transition", m.tone, open === key && "ring-2 ring-offset-1 ring-slate-200")}
            >
              <Icon size={14} weight="bold" />
              {m.label}
            </button>
          );
        })}
      </div>

      {open && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{META[open].label}</span>
            <button onClick={() => setOpen(null)} className="text-slate-400 hover:text-slate-600"><X size={14} weight="bold" /></button>
          </div>

          <div className="space-y-2">
            {(open === "reassign" || open === "recover") && (
              <input
                list="vol-names"
                value={form.assignedTo}
                onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                placeholder={open === "recover" ? "Reassign to (optional)…" : "New assignee (volunteer name)…"}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
              />
            )}
            {(open === "extend" || open === "recover") && (
              <input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
              />
            )}
            {(open === "escalate" || open === "block" || open === "reassign" || open === "extend") && (
              <input
                value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                placeholder={open === "block" ? "What's blocking it? (required)" : "Reason (optional)…"}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
              />
            )}
            {open === "recover" && (
              <input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Recovery note (optional)…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
              />
            )}

            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setOpen(null)} className="rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              <button
                onClick={() => submit(open)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {busy && <CircleNotch size={12} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <datalist id="vol-names">
        {vols.map((v) => <option key={v} value={v} />)}
      </datalist>
    </div>
  );
}
