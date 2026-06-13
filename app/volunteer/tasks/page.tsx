"use client";

import { useMemo } from "react";
import {
  ClipboardText,
  CheckCircle,
  Clock,
  UserCircle,
  CaretRight,
  MapPin,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockTasks } from "@/lib/mock/volunteer";

const statusColors = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const priorityConfig = {
  high: { label: "High", bar: "bg-red-500" },
  medium: { label: "Medium", bar: "bg-amber-500" },
  low: { label: "Low", bar: "bg-slate-400" },
} as const;

export default function VolunteerTasksPage() {
  const groupedTasks = useMemo(() => {
    return {
      high: mockTasks.filter((t) => t.priority === "high"),
      medium: mockTasks.filter((t) => t.priority === "medium"),
      low: mockTasks.filter((t) => t.priority === "low"),
    };
  }, []);

  const stats = useMemo(() => {
    return {
      total: mockTasks.length,
      open: mockTasks.filter((t) => t.status === "open").length,
      inProgress: mockTasks.filter((t) => t.status === "in-progress").length,
      completed: mockTasks.filter((t) => t.status === "completed").length,
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardText className="text-indigo-600" />
          My Tasks
        </h1>
        <p className="text-slate-500">Tasks assigned to you for today&apos;s event.</p>
      </header>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest">Total</CardTitle>
            <ClipboardText className="h-4 w-4 text-slate-500" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-blue-900 uppercase tracking-widest">Open</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.open}</div>
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
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Task List grouped by priority */}
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
                <TaskCard key={task.id} task={task} />
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
                <TaskCard key={task.id} task={task} />
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
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: (typeof mockTasks)[number] }) {
  const config = priorityConfig[task.priority];

  return (
    <Card className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-0">
        <div className="flex">
          <div className={cn("w-1.5 shrink-0", config.bar)} />
          <div className="p-5 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                  {task.title}
                </h4>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize font-semibold",
                  statusColors[task.status]
                )}
              >
                {task.status.replace("-", " ")}
              </Badge>
            </div>

            <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
              {task.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-slate-400" weight="bold" />
                <span>{task.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserCircle size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-black leading-none mb-1">Assigned By</span>
                  <span className="text-sm font-semibold text-slate-700">{task.assignedBy}</span>
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