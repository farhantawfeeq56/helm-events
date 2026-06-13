"use client";

import { useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  CircleNotch,
  Warning,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockShifts } from "@/lib/mock/volunteer";

const statusConfig = {
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CircleNotch,
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Clock,
  },
} as const;

export default function VolunteerShiftsPage() {
  const shiftCounts = useMemo(() => {
    return {
      total: mockShifts.length,
      completed: mockShifts.filter((s) => s.status === "completed").length,
      inProgress: mockShifts.filter((s) => s.status === "in-progress").length,
      upcoming: mockShifts.filter((s) => s.status === "upcoming").length,
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="text-indigo-600" />
          My Shifts
        </h1>
        <p className="text-slate-500">Today&apos;s shift schedule and assignments.</p>
      </header>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-widest">Total</CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{shiftCounts.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-blue-900 uppercase tracking-widest">Active</CardTitle>
            <CircleNotch className="h-4 w-4 text-blue-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{shiftCounts.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-amber-900 uppercase tracking-widest">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-900">{shiftCounts.upcoming}</div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Done</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" weight="bold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">{shiftCounts.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Shift List */}
      <div className="grid gap-4 md:grid-cols-2">
        {mockShifts.map((shift) => {
          const config = statusConfig[shift.status];
          const StatusIcon = config.icon;

          return (
            <Card
              key={shift.id}
              className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-0">
                <div className="flex">
                  <div
                    className={`w-1.5 shrink-0 ${
                      shift.status === "in-progress"
                        ? "bg-blue-500"
                        : shift.status === "upcoming"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                  />
                  <div className="p-5 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-slate-900 text-lg">{shift.title}</h3>
                      <Badge variant="outline" className={`capitalize font-semibold ${config.className}`}>
                        <StatusIcon size={14} className="mr-1" weight="bold" />
                        {config.label}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{shift.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} className="text-slate-400" weight="bold" />
                        <span className="font-medium">
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-slate-400" weight="bold" />
                        <span>{shift.location}</span>
                      </div>
                    </div>

                    {shift.status === "in-progress" && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full w-fit border border-blue-100">
                        <Warning size={14} weight="bold" />
                        <span>You are on duty now</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}