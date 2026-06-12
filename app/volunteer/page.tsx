"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ClipboardText,
  Clock,
  CheckCircle,
  Warning,
  Bell,
  CaretRight,
  UserCircle,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Task } from "@/types/data-hub";

import { NotificationFeed } from "@/components/operations/notification-feed";
import { VolunteerHermesAssistant } from "@/components/agent/volunteer-hermes-assistant";

const VOLUNTEER_NAME = "Volunteer User";

export default function VolunteerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // In a real app, we'd get the logged-in user's name from auth
        const tasksRes = await fetch(`/api/tasks?assignedTo=${encodeURIComponent(VOLUNTEER_NAME)}`);

        const tasksData = await tasksRes.json();

        if (tasksData.success) {
          setTasks(tasksData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const stats = useMemo(() => {
    return {
      assigned: tasks.filter((t) => t.status === "open").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    return {
      high: tasks.filter((t) => t.priority === "high"),
      medium: tasks.filter((t) => t.priority === "medium"),
      low: tasks.filter((t) => t.priority === "low"),
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <header className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-48" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Volunteer Dashboard</h1>
        <p className="text-slate-500">Welcome back, {VOLUNTEER_NAME}! Here&apos;s your operational overview.</p>
      </header>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-blue-900 uppercase tracking-widest">Assigned</CardTitle>
            <ClipboardText className="h-4 w-4 text-blue-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.assigned}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium">Pending action</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-amber-900 uppercase tracking-widest">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{stats.inProgress}</div>
            <p className="text-xs text-amber-600 mt-1 font-medium">Currently being handled</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{stats.completed}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Great job!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ClipboardText size={24} className="text-slate-400" />
              My Tasks
            </h2>
            <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">
              {tasks.length} total
            </Badge>
          </div>

          {tasks.length === 0 ? (
            <Card className="border-dashed py-16 bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
                <p className="text-sm text-slate-500 max-w-[240px] mt-2">
                  You don&apos;t have any tasks assigned at the moment. Check back later or contact your lead.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* High Priority */}
              {groupedTasks.high.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    High Priority
                  </h3>
                  <div className="grid gap-4">
                    {groupedTasks.high.map((task) => (
                      <TaskCard key={task._id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority */}
              {groupedTasks.medium.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-600" />
                    Medium Priority
                  </h3>
                  <div className="grid gap-4">
                    {groupedTasks.medium.map((task) => (
                      <TaskCard key={task._id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {/* Low Priority */}
              {groupedTasks.low.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Low Priority
                  </h3>
                  <div className="grid gap-4">
                    {groupedTasks.low.map((task) => (
                      <TaskCard key={task._id} task={task} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications Sidebar */}
        <div className="space-y-6">
          {/* Need Help Card */}
          <Card className="bg-slate-900 text-white overflow-hidden border-none shadow-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">Hermes AI</span>
              </div>
              <CardTitle className="text-xl font-bold tracking-tight">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Report issues, ask for directions, or get assistance with your tasks instantly.
              </p>
              <VolunteerHermesAssistant variant="inline" />
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bell size={24} className="text-slate-400" />
              Recent Signals
            </h2>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <NotificationFeed recipient={VOLUNTEER_NAME} limit={5} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const statusColors = {
    open: "bg-blue-100 text-blue-700 border-blue-200",
    "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    blocked: "bg-red-100 text-red-700 border-red-200",
    cancelled: "bg-slate-100 text-slate-700 border-slate-200",
    escalated: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Card className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-0">
        <div className="flex">
          <div className={cn("w-1.5 shrink-0", 
            task.priority === 'high' ? 'bg-red-500' : 
            task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
          )} />
          <div className="p-5 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                  {task.title}
                </h4>
                {task.incidentId && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full w-fit border border-amber-100">
                    <Warning size={14} weight="bold" />
                    <span>Incident: {typeof task.incidentId === 'string' ? 'Ref #' + task.incidentId.slice(-4) : task.incidentId.type}</span>
                  </div>
                )}
              </div>
              <Badge variant="outline" className={cn("capitalize font-semibold", statusColors[task.status])}>
                {task.status.replace("-", " ")}
              </Badge>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-5 leading-relaxed">
              {task.description || "No description provided for this task."}
            </p>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserCircle size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-black leading-none mb-1">Assigned By</span>
                  <span className="text-sm font-semibold text-slate-700">{task.assignedBy || "Operations Control"}</span>
                </div>
              </div>
              <button className="h-8 w-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                <CaretRight size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
