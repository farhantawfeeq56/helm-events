"use client";

import { 
  ClipboardText, 
  Calendar, 
  WarningOctagon, 
  Clock, 
  MapPin, 
  User 
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VolunteerDashboard() {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Volunteer Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here&apos;s your schedule for today.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-indigo-100 bg-indigo-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-indigo-900">Active Shift</CardTitle>
              <Clock className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">Registration Desk</div>
              <p className="text-xs text-indigo-600 mt-1">09:00 AM - 01:00 PM (Ends in 2h 15m)</p>
              <div className="mt-4 flex items-center gap-2 text-sm text-indigo-700">
                <MapPin size={16} />
                <span>Main Lobby, Level 1</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
              <ClipboardText className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-slate-500 mt-1">2 completed, 3 remaining</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Restock badge holders</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                  <span>Check VIP lounge water</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
              <WarningOctagon className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-slate-500 mt-1">In your assigned area</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Spill near entrance A</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "Tomorrow", time: "10:00 AM", role: "Session Monitor", location: "Ballroom B" },
                  { date: "Oct 24", time: "02:00 PM", role: "Information Desk", location: "Concourse" },
                ].map((shift, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Calendar size={20} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{shift.role}</p>
                        <p className="text-xs text-slate-500 mt-1">{shift.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{shift.date}</p>
                      <p className="text-xs text-slate-500">{shift.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Team Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                  <User size={24} className="text-slate-600" />
                </div>
                <div>
                  <p className="font-medium">Sarah Jenkins</p>
                  <p className="text-sm text-slate-500">Floor Manager - Level 1</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <button className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90">
                  Message Sarah
                </button>
                <button className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100">
                  Report Issue
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
