"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardText,
  CheckCircle,
  Clock,
  UserCircle,
  MapPin,
  ChatCircleText,
  PaperPlaneTilt,
  CircleNotch,
  SpinnerGap,
  Sparkle,
  Timer,
  Prohibit,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { isOverdue, dueLabel } from "@/lib/tasks";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "open" | "in-progress" | "completed" | "blocked" | "cancelled" | "escalated";
  priority: "low" | "medium" | "high";
  location?: string;
  assignedBy?: string;
  assignedTo?: string;
  assignmentReason?: string;
  dueAt?: string;
  blockedReason?: string;
  escalationLevel?: number;
}

interface TaskMessage {
  _id: string;
  content: string;
  sender: { id: string; name: string; role: string };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blocked: "bg-rose-100 text-rose-700 border-rose-200",
  escalated: "bg-purple-100 text-purple-700 border-purple-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

const priorityConfig = {
  high: { label: "High", bar: "bg-red-500", dot: "bg-red-600", text: "text-red-600" },
  medium: { label: "Medium", bar: "bg-amber-500", dot: "bg-amber-600", text: "text-amber-600" },
  low: { label: "Low", bar: "bg-slate-400", dot: "bg-slate-400", text: "text-slate-500" },
} as const;

export default function VolunteerTasksPage() {
  const user = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!user?.name) return;
    try {
      const res = await fetch(`/api/tasks?assignedTo=${encodeURIComponent(user.name)}&limit=100`);
      const data = await res.json();
      if (data.success) setTasks(data.data as Task[]);
    } catch {
      /* keep whatever we have */
    } finally {
      setLoading(false);
    }
  }, [user?.name]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Optimistic local update; reconciled by the server response.
  const updateTaskStatus = useCallback(async (taskId: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status } : t)));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      loadTasks(); // revert to server truth on failure
    }
  }, [loadTasks]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      open: tasks.filter((t) => t.status === "open").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks],
  );

  const grouped = useMemo(() => {
    const active = tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled");
    const done = tasks.filter((t) => t.status === "completed" || t.status === "cancelled");
    return {
      high: active.filter((t) => t.priority === "high"),
      medium: active.filter((t) => t.priority === "medium"),
      low: active.filter((t) => t.priority === "low"),
      done,
    };
  }, [tasks]);

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardText className="text-indigo-600" />
          My Tasks
        </h1>
        <p className="text-slate-500">
          {user?.name ? `Tasks assigned to ${user.name}.` : "Tasks assigned to you for today's event."}
        </p>
      </header>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} icon={<ClipboardText className="h-4 w-4 text-slate-500" weight="bold" />} tone="slate" />
        <StatCard label="Open" value={stats.open} icon={<Clock className="h-4 w-4 text-blue-600" weight="bold" />} tone="blue" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<Clock className="h-4 w-4 text-amber-600" weight="bold" />} tone="amber" />
        <StatCard label="Completed" value={stats.completed} icon={<CheckCircle className="h-4 w-4 text-emerald-600" weight="bold" />} tone="emerald" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <CircleNotch size={40} className="animate-spin mb-3" />
          <p className="text-sm font-medium">Loading your tasks…</p>
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed bg-slate-50/50 py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-emerald-400" weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">You&apos;re all caught up</h3>
            <p className="text-sm text-slate-500 max-w-[280px] mt-2">
              No tasks are assigned to you right now. New assignments will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <PrioritySection title="High Priority" tone="high" tasks={grouped.high} onStatusChange={updateTaskStatus} onReload={loadTasks} user={user} />
          <PrioritySection title="Medium Priority" tone="medium" tasks={grouped.medium} onStatusChange={updateTaskStatus} onReload={loadTasks} user={user} />
          <PrioritySection title="Low Priority" tone="low" tasks={grouped.low} onStatusChange={updateTaskStatus} onReload={loadTasks} user={user} />

          {grouped.done.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <CheckCircle size={14} weight="fill" />
                Completed
              </h3>
              <div className="grid gap-4">
                {grouped.done.map((task) => (
                  <TaskCard key={task._id} task={task} onStatusChange={updateTaskStatus} onReload={loadTasks} user={user} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-50/50 border-slate-200 text-slate-900",
    blue: "bg-blue-50/50 border-blue-100 text-blue-900",
    amber: "bg-amber-50/50 border-amber-100 text-amber-900",
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

function PrioritySection({
  title,
  tone,
  tasks,
  onStatusChange,
  onReload,
  user,
}: {
  title: string;
  tone: keyof typeof priorityConfig;
  tasks: Task[];
  onStatusChange: (id: string, status: Task["status"]) => void;
  onReload: () => void;
  user: ReturnType<typeof useAuth>;
}) {
  if (tasks.length === 0) return null;
  const cfg = priorityConfig[tone];
  return (
    <div className="space-y-4">
      <h3 className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", cfg.text)}>
        <span className={cn("h-2 w-2 rounded-full", cfg.dot, tone === "high" && "animate-pulse")} />
        {title}
      </h3>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onStatusChange={onStatusChange} onReload={onReload} user={user} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onReload,
  user,
}: {
  task: Task;
  onStatusChange: (id: string, status: Task["status"]) => void;
  onReload: () => void;
  user: ReturnType<typeof useAuth>;
}) {
  const cfg = priorityConfig[task.priority] ?? priorityConfig.medium;
  const [showMessages, setShowMessages] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);
  const isDone = task.status === "completed";
  const overdue = isOverdue(task);
  const due = dueLabel(task);

  async function reportBlocker() {
    const reason = blockReason.trim();
    if (!reason || blocking) return;
    setBlocking(true);
    try {
      await fetch(`/api/tasks/${task._id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block", reason }),
      });
      setShowBlock(false);
      setBlockReason("");
      onReload();
    } finally {
      setBlocking(false);
    }
  }

  return (
    <Card className="overflow-hidden border-slate-200 transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex">
          <div className={cn("w-1.5 shrink-0", cfg.bar)} />
          <div className="flex-1 p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <h4 className={cn("text-lg font-bold text-slate-900", isDone && "line-through opacity-60")}>
                {task.title}
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {overdue && (
                  <Badge variant="outline" className="border-rose-200 bg-rose-50 font-semibold text-rose-700">
                    <Timer size={12} weight="bold" className="mr-1" /> {due}
                  </Badge>
                )}
                {(task.escalationLevel ?? 0) > 0 && (
                  <Badge variant="outline" className="border-orange-200 bg-orange-50 font-semibold text-orange-700">
                    Escalated
                  </Badge>
                )}
                <Badge variant="outline" className={cn("font-semibold capitalize", statusColors[task.status])}>
                  {task.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            {task.description && (
              <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-600">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              {task.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400" weight="bold" />
                  <span>{task.location}</span>
                </div>
              )}
              {task.assignedBy && (
                <div className="flex items-center gap-1.5">
                  <UserCircle size={16} className="text-slate-400" weight="bold" />
                  <span>By {task.assignedBy}</span>
                </div>
              )}
            </div>

            {task.assignmentReason && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
                <Sparkle size={16} weight="fill" className="mt-0.5 shrink-0 text-indigo-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Why this is yours</p>
                  <p className="text-sm leading-relaxed text-indigo-900/80">{task.assignmentReason}</p>
                </div>
              </div>
            )}

            {task.status === "blocked" && task.blockedReason && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2.5">
                <Prohibit size={16} weight="bold" className="mt-0.5 shrink-0 text-rose-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Blocked — organizer notified</p>
                  <p className="text-sm leading-relaxed text-rose-900/80">{task.blockedReason}</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              {!isDone ? (
                <button
                  onClick={() => onStatusChange(task._id, "completed")}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500"
                >
                  <CheckCircle size={16} weight="bold" />
                  Mark Complete
                </button>
              ) : (
                <button
                  onClick={() => onStatusChange(task._id, "in-progress")}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300"
                >
                  Reopen
                </button>
              )}

              {!isDone && task.status !== "in-progress" && (
                <button
                  onClick={() => onStatusChange(task._id, "in-progress")}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 transition hover:border-amber-300"
                >
                  <Clock size={16} weight="bold" />
                  Start
                </button>
              )}

              <button
                onClick={() => setShowMessages((s) => !s)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition",
                  showMessages
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600",
                )}
              >
                <ChatCircleText size={16} weight="bold" />
                Message organizer
              </button>

              {!isDone && task.status !== "blocked" && (
                <button
                  onClick={() => setShowBlock((s) => !s)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition",
                    showBlock
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600",
                  )}
                >
                  <Prohibit size={16} weight="bold" />
                  Report blocker
                </button>
              )}
            </div>

            {showBlock && !isDone && task.status !== "blocked" && (
              <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-rose-500">
                  What&apos;s blocking this task?
                </label>
                <p className="mb-2 text-xs text-rose-900/70">
                  This flags the task to organizers and notifies whoever assigned it.
                </p>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Vendor hasn't delivered the barriers; can't set up the perimeter."
                  className="w-full resize-none rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={reportBlocker}
                    disabled={blocking || !blockReason.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {blocking ? <SpinnerGap size={16} className="animate-spin" /> : <Prohibit size={16} weight="bold" />}
                    Flag as blocked
                  </button>
                  <button
                    onClick={() => {
                      setShowBlock(false);
                      setBlockReason("");
                    }}
                    className="rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {showMessages && <MessageThread taskId={task._id} user={user} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MessageThread({ taskId, user }: { taskId: string; user: ReturnType<typeof useAuth> }) {
  const [messages, setMessages] = useState<TaskMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { id: user?.email || "volunteer", name: user?.name || "Volunteer", role: "volunteer" },
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
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="mb-3 max-h-56 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-xs font-medium text-slate-400">
            <SpinnerGap size={16} className="animate-spin" /> Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <p className="py-3 text-center text-xs font-medium text-slate-400">
            No messages yet. Send a note to the organizers about this task.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender?.role === "volunteer";
            return (
              <div key={m._id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    mine ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-700",
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
          placeholder="Message the organizers…"
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
