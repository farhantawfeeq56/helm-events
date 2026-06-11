import Link from "next/link";
import { notFound } from "next/navigation";
import { getTaskById } from "@/lib/repositories/task-repository";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Target, 
  CheckCircle,
  Info,
  Calendar,
  User,
  Warning,
  Circle
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusTransition, type TaskStatus } from "@/components/operations/task/status-transition";
import { ActivityTimeline } from "@/components/operations/activity-timeline";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-rose-100 text-rose-700 border-rose-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "low": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "text-emerald-600";
      case "in-progress": return "text-amber-600";
      case "blocked": return "text-rose-600";
      case "cancelled": return "text-slate-500";
      default: return "text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <Link
          href="/operations?collection=tasks"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={16} weight="bold" />
          BACK TO TASKS
        </Link>

        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={cn("text-xs font-black uppercase tracking-widest px-3 py-1", getPriorityColor(task.priority))}>
              {task.priority || "MEDIUM"} PRIORITY
            </Badge>
            <div className={cn("flex items-center gap-2 text-sm font-bold", getStatusColor(task.status))}>
              <Circle size={8} weight="fill" />
              <span className="uppercase tracking-widest">{task.status || "OPEN"}</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
            {task.title}
          </h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Status & Lifecycle */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Task Lifecycle</h2>
              <StatusTransition taskId={task._id.toString()} currentStatus={task.status as TaskStatus} />
            </section>

            {/* Core Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-indigo-600">
                  <Target size={20} weight="bold" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Objective</h3>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {task.objective || "No objective defined for this task."}
                </p>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-emerald-600">
                  <CheckCircle size={20} weight="bold" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Expected Outcome</h3>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {task.expectedOutcome || "No expected outcome defined."}
                </p>
              </Card>
            </div>

            <Card className="p-8 rounded-3xl border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <Info size={20} weight="bold" />
                <h3 className="text-sm font-black uppercase tracking-widest">Full Description</h3>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                {task.description || "No detailed description provided."}
              </p>
            </Card>

            {/* Activity Timeline */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Clock size={18} weight="bold" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Activity Timeline</h2>
              </div>
              <ActivityTimeline target={`task:${task._id}`} />
            </section>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8 lg:sticky lg:top-8">
            
            {/* Context Panel */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">Context</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar size={14} weight="bold" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Event</p>
                  </div>
                  <p className="font-black text-slate-900 uppercase tracking-tight">
                    {task.eventId?.name || task.eventId || "Unknown Event"}
                  </p>
                </div>
                
                {task.incidentId && (
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Warning size={14} weight="bold" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Related Incident</p>
                    </div>
                    <Link 
                      href={`/incidents/${task.incidentId._id || task.incidentId}`}
                      className="font-black text-indigo-600 hover:underline uppercase tracking-tight"
                    >
                      {task.incidentId?.title || task.incidentId?.type || "View Incident"}
                    </Link>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <MapPin size={14} weight="bold" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Location</p>
                  </div>
                  <p className="font-black text-slate-900 uppercase tracking-tight">
                    {task.location || "Not specified"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <User size={14} weight="bold" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Assigned To</p>
                  </div>
                  <p className="font-black text-slate-900 uppercase tracking-tight">
                    {task.assignedTo || "Unassigned"}
                  </p>
                </div>

                <div className="pt-4">
                  <div className="rounded-2xl bg-slate-900 p-6 text-white text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Created</p>
                    <p className="text-sm font-bold">
                      {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
