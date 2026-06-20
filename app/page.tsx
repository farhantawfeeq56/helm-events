import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { Speaker } from "@/models/speaker";
import { Session } from "@/models/session";
import { Volunteer } from "@/models/volunteer";
import { Activity } from "@/models/activity";
import { getActiveEvent } from "@/lib/context/contextService";
import { computeEventMetrics } from "@/lib/services/metrics-service";

// Live dashboard: reads counts from MongoDB on each request. Must not be
// statically prerendered at build time (the DB may be unreachable then).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await connectToDatabase();

  const [eventCount, speakerCount, sessionCount, volunteerCount, recentActivities, activeEvent] = await Promise.all([
    Event.countDocuments(),
    Speaker.countDocuments(),
    Session.countDocuments(),
    Volunteer.countDocuments(),
    Activity.find().sort({ createdAt: -1 }).limit(5).lean(),
    getActiveEvent().catch(() => null),
  ]);

  const metrics = activeEvent?._id ? await computeEventMetrics(String(activeEvent._id)) : null;

  const readinessTone =
    !metrics || metrics.operationalReadiness >= 80
      ? "text-emerald-600"
      : metrics.operationalReadiness >= 55
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500">Welcome to your event operations console.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Total Events</div>
            <div className="mt-2 text-2xl font-bold">{eventCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Total Speakers</div>
            <div className="mt-2 text-2xl font-bold">{speakerCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Active Sessions</div>
            <div className="mt-2 text-2xl font-bold">{sessionCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-slate-500">Volunteers</div>
            <div className="mt-2 text-2xl font-bold">{volunteerCount}</div>
          </div>
        </div>

        {metrics && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-semibold">Operational Performance</div>
              <Link href="/operations/metrics" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View metrics →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Readiness</div>
                <div className={`mt-1 text-2xl font-black ${readinessTone}`}>{metrics.operationalReadiness}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Task Completion</div>
                <div className="mt-1 text-2xl font-black text-slate-900">
                  {metrics.taskCompletionRate}<span className="text-base text-slate-400">%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Incident Resolution</div>
                <div className="mt-1 text-2xl font-black text-slate-900">
                  {metrics.incidentResolutionRate}<span className="text-base text-slate-400">%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Open Incidents</div>
                <div className="mt-1 text-2xl font-black text-slate-900">{metrics.incidentsActive}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="font-semibold">Recent Activity</div>
            <div className="mt-4 space-y-4">
              {recentActivities.length > 0 ? (
                (recentActivities as unknown as Array<{ _id: unknown; details?: string; createdAt: string | Date }>).map((activity) => (
                  <div key={String(activity._id)} className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-sky-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-snug line-clamp-2">
                        {activity.details}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No recent activity found.</p>
              )}
            </div>
          </div>
          <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="font-semibold">Quick Actions</div>
            <div className="mt-4 flex flex-col gap-2">
              <button className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
                Create New Event
              </button>
              <button className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
                Add Speaker
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
