import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models/event";
import { Speaker } from "@/models/speaker";
import { Sponsor } from "@/models/sponsor";
import { Session } from "@/models/session";
import { Room } from "@/models/room";
import { Volunteer } from "@/models/volunteer";
import { Attendee } from "@/models/attendee";
import { Organizer } from "@/models/organizer";
import { Facility } from "@/models/facility";
import { CollectionView } from "@/components/operations/collection-view";
import Link from "next/link";
import {
  Users,
  Calendar,
  MapPin,
  MicrophoneStage,
  Handshake,
  ChartLineUp,
  Pulse,
  ShieldCheck,
  ArrowLeft,
  CaretRight,
  Clock,
  CheckCircle,
  Buildings,
  IdentificationCard,
} from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>;
}) {
  await connectToDatabase();
  const { collection } = await searchParams;

  // Fetch counts
  const [
    eventCount,
    speakerCount,
    sponsorCount,
    sessionCount,
    roomCount,
    volunteerCount,
    attendeeCount,
    organizerCount,
    facilityCount,
  ] = await Promise.all([
    Event.countDocuments(),
    Speaker.countDocuments(),
    Sponsor.countDocuments(),
    Session.countDocuments(),
    Room.countDocuments(),
    Volunteer.countDocuments(),
    Attendee.countDocuments(),
    Organizer.countDocuments(),
    Facility.countDocuments(),
  ]);

  // Fetch latest event for overview
  const latestEvent = await Event.findOne()
    .sort({ createdAt: -1 })
    .lean();

  if (collection) {
    const titles: Record<string, string> = {
      speakers: "Speakers",
      attendees: "Attendees",
      volunteers: "Volunteers",
      sponsors: "Sponsors",
      events: "Events",
      sessions: "Sessions",
      rooms: "Rooms",
      organizers: "Organizers",
      facilities: "Facilities",
      logs: "API Logs",
      health: "System Health",
      analytics: "Analytics",
    };

    const title = titles[collection];

    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto w-full max-w-6xl">
          <Link
            href="/operations"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to Data Hub
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {title ? (
              <CollectionView
                title={title}
                collectionName={collection}
                latestEventId={latestEvent?._id?.toString()}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                  <Pulse size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Coming Soon
                </h3>
                <p className="mt-2 max-w-xs text-slate-500">
                  The {collection} management interface is currently under
                  development.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    {
      title: "People",
      description: "Manage event participants and stakeholders",
      items: [
        {
          id: "speakers",
          name: "Speakers",
          icon: MicrophoneStage,
          count: speakerCount,
          color: "text-indigo-600",
          bg: "bg-indigo-50",
        },
        {
          id: "attendees",
          name: "Attendees",
          icon: Users,
          count: attendeeCount,
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          id: "volunteers",
          name: "Volunteers",
          icon: Users,
          count: volunteerCount,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
        {
          id: "sponsors",
          name: "Sponsors",
          icon: Handshake,
          count: sponsorCount,
          color: "text-amber-600",
          bg: "bg-amber-50",
        },
        {
          id: "organizers",
          name: "Organizers",
          icon: IdentificationCard,
          count: organizerCount,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
      ],
    },
    {
      title: "Operations",
      description: "Core logistics and infrastructure",
      items: [
        {
          id: "events",
          name: "Events",
          icon: Calendar,
          count: eventCount,
          color: "text-sky-600",
          bg: "bg-sky-50",
        },
        {
          id: "sessions",
          name: "Sessions",
          icon: Clock,
          count: sessionCount,
          color: "text-violet-600",
          bg: "bg-violet-50",
        },
        {
          id: "rooms",
          name: "Rooms",
          icon: MapPin,
          count: roomCount,
          color: "text-rose-600",
          bg: "bg-rose-50",
        },
        {
          id: "facilities",
          name: "Facilities",
          icon: Buildings,
          count: facilityCount,
          color: "text-emerald-600",
          bg: "bg-emerald-50",
        },
      ],
    },
    {
      title: "Runtime",
      description: "System health and real-time analytics",
      items: [
        {
          id: "logs",
          name: "API Logs",
          icon: Pulse,
          count: "Live",
          color: "text-slate-600",
          bg: "bg-slate-50",
        },
        {
          id: "health",
          name: "System Health",
          icon: ShieldCheck,
          count: "100%",
          color: "text-blue-600",
          bg: "bg-blue-50",
        },
        {
          id: "analytics",
          name: "Analytics",
          icon: ChartLineUp,
          count: "v2.0",
          color: "text-orange-600",
          bg: "bg-orange-50",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.05),_transparent_25%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.05),_transparent_25%),#f8fafc] px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Event Data Hub
            </h1>
            <p className="text-lg text-slate-500">
              Centralized operational control for your event ecosystem.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 ring-inset">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected to MongoDB
            </span>
          </div>
        </header>

        {/* Event Overview Section */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="grid lg:grid-cols-[1fr_auto]">
            <div className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Calendar size={24} weight="bold" />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                    Active Event Overview
                  </h2>
                </div>
              </div>

              {latestEvent ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">
                      {(latestEvent as any).name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={18} />
                        <span>
                          {(latestEvent as any).venue}, {(latestEvent as any).city}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={18} />
                        <span>
                          {new Date((latestEvent as any).startDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={18} className="text-emerald-500" />
                        <span className="capitalize">{(latestEvent as any).status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Speakers
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {speakerCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Sessions
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {sessionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Volunteers
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {volunteerCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Status
                      </p>
                      <div className="mt-1">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                          80% Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <p className="text-slate-500">
                    No events found. Start by creating your first event.
                  </p>
                  <Link
                    href="?collection=events"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    Create Event
                    <CaretRight size={16} weight="bold" />
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden border-l border-slate-100 bg-slate-50/50 p-8 lg:block lg:w-80">
              <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Quick Actions
              </h4>
              <div className="space-y-3">
                <Link
                  href="?collection=events"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  Create New Event
                  <CaretRight size={14} />
                </Link>
                <Link
                  href="?collection=speakers"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  Add Keynote Speaker
                  <CaretRight size={14} />
                </Link>
                <Link
                  href="?collection=sessions"
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  Schedule Session
                  <CaretRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Collection Grid */}
        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category.title} className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {category.title}
                </h2>
                <p className="text-slate-500">{category.description}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`?collection=${item.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
                      >
                        <item.icon size={28} weight="duotone" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {item.count}
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-400 transition-colors group-hover:text-indigo-600">
                        Manage collection
                        <CaretRight
                          size={14}
                          weight="bold"
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                    <div className="absolute right-0 bottom-0 h-24 w-24 translate-x-8 translate-y-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
                      <item.icon size={96} weight="fill" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
