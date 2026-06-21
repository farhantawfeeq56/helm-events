"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  CircleNotch,
  Warning,
  IdentificationBadge,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { getShiftDisplayStatus, type ShiftDisplayStatus } from "@/lib/shifts";

interface Shift {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  role?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  assignedTo?: string;
  status?: string;
}

const statusConfig: Record<
  ShiftDisplayStatus,
  { label: string; className: string; bar: string; icon: typeof Clock }
> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
    icon: CheckCircle,
  },
  "in-progress": {
    label: "On Duty Now",
    className: "bg-blue-100 text-blue-700 border-blue-200",
    bar: "bg-blue-500",
    icon: CircleNotch,
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-slate-100 text-slate-500 border-slate-200",
    bar: "bg-slate-400",
    icon: Warning,
  },
};

export default function VolunteerShiftsPage() {
  const user = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const loadShifts = useCallback(async () => {
    if (!user?.name) return;
    try {
      const res = await fetch(`/api/shifts?assignedTo=${encodeURIComponent(user.name)}&limit=100`);
      const data = await res.json();
      if (data.success) setShifts(data.data as Shift[]);
    } catch {
      /* keep whatever we have */
    } finally {
      setLoading(false);
    }
  }, [user?.name]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  // Derive the live status of each shift from its time window (re-derived on render).
  const withStatus = useMemo(
    () => shifts.map((s) => ({ shift: s, display: getShiftDisplayStatus(s) })),
    [shifts],
  );

  const counts = useMemo(
    () => ({
      total: withStatus.length,
      inProgress: withStatus.filter((s) => s.display === "in-progress").length,
      upcoming: withStatus.filter((s) => s.display === "upcoming").length,
      completed: withStatus.filter((s) => s.display === "completed").length,
    }),
    [withStatus],
  );

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="text-indigo-600" />
          My Shifts
        </h1>
        <p className="text-slate-500">
          {user?.name ? `Shift schedule assigned to ${user.name}.` : "Your shift schedule and assignments."}
        </p>
      </header>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <StatCard label="Total" value={counts.total} tone="slate" icon={<Calendar className="h-4 w-4 text-slate-500" weight="bold" />} />
        <StatCard label="Active" value={counts.inProgress} tone="blue" icon={<CircleNotch className="h-4 w-4 text-blue-600" weight="bold" />} />
        <StatCard label="Upcoming" value={counts.upcoming} tone="amber" icon={<Clock className="h-4 w-4 text-amber-600" weight="bold" />} />
        <StatCard label="Done" value={counts.completed} tone="emerald" icon={<CheckCircle className="h-4 w-4 text-emerald-600" weight="bold" />} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <CircleNotch size={40} className="animate-spin mb-3" />
          <p className="text-sm font-medium">Loading your shifts…</p>
        </div>
      ) : withStatus.length === 0 ? (
        <Card className="border-dashed bg-slate-50/50 py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <Calendar size={32} className="text-indigo-400" weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No shifts scheduled</h3>
            <p className="text-sm text-slate-500 max-w-[280px] mt-2">
              You have no shifts assigned right now. New assignments from the operations team will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {withStatus.map(({ shift, display }) => {
            const config = statusConfig[display];
            const StatusIcon = config.icon;

            return (
              <Card
                key={shift._id}
                className="overflow-hidden border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-0">
                  <div className="flex">
                    <div className={cn("w-1.5 shrink-0", config.bar)} />
                    <div className="p-5 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-slate-900 text-lg">{shift.title}</h3>
                        <Badge variant="outline" className={cn("capitalize font-semibold", config.className)}>
                          <StatusIcon size={14} className="mr-1" weight="bold" />
                          {config.label}
                        </Badge>
                      </div>

                      {shift.description && (
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{shift.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        {(shift.startTime || shift.date) && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-slate-400" weight="bold" />
                            <span className="font-medium">
                              {shift.date ? `${shift.date} · ` : ""}
                              {shift.startTime || "—"}
                              {shift.endTime ? ` - ${shift.endTime}` : ""}
                            </span>
                          </div>
                        )}
                        {shift.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-slate-400" weight="bold" />
                            <span>{shift.location}</span>
                          </div>
                        )}
                        {shift.role && (
                          <div className="flex items-center gap-1.5">
                            <IdentificationBadge size={16} className="text-slate-400" weight="bold" />
                            <span>{shift.role}</span>
                          </div>
                        )}
                      </div>

                      {display === "in-progress" && (
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
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: string;
  icon: React.ReactNode;
}) {
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
