import Link from "next/link";
import { notFound } from "next/navigation";
import { getIncidentById } from "@/lib/repositories/incident-repository";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  CheckCircle,
  Chats,
  Info,
  Circle,
  WarningCircle,
  Broadcast,
  IdentificationCard,
  Shield,
  Pulse
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const incident = await getIncidentById(incidentId);

  if (!incident) {
    notFound();
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-rose-100 text-rose-700 border-rose-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "low": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved": return "text-emerald-600";
      case "investigating": return "text-amber-600";
      case "in progress": return "text-blue-600";
      default: return "text-slate-600";
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "room": return <MapPin size={24} weight="duotone" />;
      case "speaker": return <User size={24} weight="duotone" />;
      case "session": return <Broadcast size={24} weight="duotone" />;
      case "sponsor": return <IdentificationCard size={24} weight="duotone" />;
      default: return <Calendar size={24} weight="duotone" />;
    }
  };

  const getCategory = (id: string) => {
    if (id.includes("speaker")) return "Speaker Operations";
    if (id.includes("internet") || id.includes("wifi")) return "Infrastructure";
    if (id.includes("sponsor")) return "Partner Relations";
    if (id.includes("volunteer")) return "Staffing";
    if (id.includes("room")) return "Logistics";
    return "General Operations";
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={16} weight="bold" />
          BACK TO INCIDENTS
        </Link>

        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={cn("text-xs font-black uppercase tracking-widest px-3 py-1", getSeverityColor(incident.severity))}>
              {incident.severity} SEVERITY
            </Badge>
            <div className={cn("flex items-center gap-2 text-sm font-bold", getStatusColor(incident.status))}>
              <Circle size={8} weight="fill" />
              <span className="uppercase tracking-widest">{incident.status}</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
            {incident.title}
          </h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Situation Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Info size={18} weight="bold" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Current Situation</h2>
              </div>
              <div className="rounded-3xl border-2 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                <p className="text-2xl font-bold text-slate-900 leading-snug">
                  {incident.situation}
                </p>
                <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-6">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Assigned to Incident Response Team Alpha
                  </p>
                </div>
              </div>
            </section>

            {/* Affected Resources Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Pulse size={18} weight="bold" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Affected Resources</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {incident.affectedResources.map((resource) => (
                  <div key={resource.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-900">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4">
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl",
                          resource.impact === "high" ? "bg-rose-50 text-rose-600" : 
                          resource.impact === "medium" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                        )}>
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 uppercase tracking-tight">{resource.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{resource.type}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[10px] font-black uppercase tracking-tighter",
                        resource.impact === "high" ? "bg-rose-100 text-rose-700" : 
                        resource.impact === "medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {resource.impact} Impact
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Communications Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Chats size={18} weight="bold" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Communications</h2>
              </div>
              <div className="space-y-4">
                {incident.communications.length > 0 ? (
                  incident.communications.map((comm) => (
                    <div key={comm.id} className="flex gap-6 rounded-3xl border border-slate-200 bg-white p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <Chats size={24} weight="duotone" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-900">{comm.channel}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">To: {comm.audience}</span>
                          <Badge variant="outline" className={cn(
                            "ml-auto text-[10px] font-black uppercase tracking-widest",
                            comm.status === "sent" ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-slate-200 text-slate-400"
                          )}>
                            {comm.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                          &ldquo;{comm.message}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No communications dispatched yet</p>
                  </div>
                )}
              </div>
            </section>

            {/* Timeline Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Clock size={18} weight="bold" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Incident Timeline</h2>
              </div>
              <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200">
                {incident.timeline.map((event) => (
                  <div key={event.id} className="relative pl-12">
                    <div className={cn(
                      "absolute left-0 flex items-center justify-center w-10 h-10 rounded-xl border-4 border-slate-50 z-10 shadow-sm",
                      event.status === "completed" ? "bg-emerald-500" : "bg-indigo-500"
                    )}>
                      {event.status === "completed" ? (
                        <CheckCircle size={18} className="text-white" weight="bold" />
                      ) : (
                        <Pulse size={18} className="text-white" weight="bold" />
                      )}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{event.title}</h3>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{event.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8 lg:sticky lg:top-8">
            
            {/* Quick Facts Panel */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8">Quick Facts</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Incident ID</p>
                  <p className="font-black text-slate-900 uppercase tracking-tight">#{incident.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Event ID</p>
                  <p className="font-black text-slate-900 uppercase tracking-tight">{incident.eventId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Incident Category</p>
                  <p className="font-black text-slate-900 uppercase tracking-tight">{getCategory(incident.id)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reported At</p>
                  <p className="font-black text-slate-900 uppercase tracking-tight">{incident.timestamp}</p>
                </div>
                <div className="pt-4">
                  <div className="rounded-2xl bg-slate-900 p-6 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Response Status</p>
                    <p className="text-sm font-bold leading-relaxed">
                      {incident.executionStatus}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Risks Panel */}
            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <WarningCircle size={20} weight="bold" className="text-rose-500" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Risk Assessment</h2>
              </div>
              <div className="space-y-8">
                {incident.risks.map((risk) => (
                  <div key={risk.id} className="group space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">{risk.title}</h3>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase px-2",
                        risk.impact === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {risk.impact}
                      </Badge>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 group-hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={14} weight="bold" className="text-indigo-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Mitigation Strategy</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        {risk.mitigation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
