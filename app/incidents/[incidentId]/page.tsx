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
  ShieldCheck,
  Chats,
  Info,
  Circle
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

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={16} weight="bold" />
          BACK TO INCIDENTS
        </Link>

        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className={cn("text-xs font-black uppercase tracking-widest px-3 py-1", getSeverityColor(incident.severity))}>
                {incident.severity} SEVERITY
              </Badge>
              <div className={cn("flex items-center gap-2 text-sm font-bold", getStatusColor(incident.status))}>
                <Circle size={8} weight="fill" />
                <span className="uppercase tracking-widest">{incident.status}</span>
              </div>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {incident.title}
            </h1>
            <p className="text-xl font-medium text-slate-500 leading-relaxed">
              {incident.description}
            </p>
          </div>
          
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm min-w-[240px]">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">REPORTED</p>
                <p className="mt-1 font-bold text-slate-900">{incident.timestamp}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">EVENT ID</p>
                <p className="mt-1 font-bold text-slate-900 uppercase">{incident.eventId}</p>
              </div>
              <div className="pt-2">
                <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100">
                   <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">AGENT STATUS</p>
                   <p className="mt-1 text-sm font-bold text-indigo-900">{incident.executionStatus}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Situation Section */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Info size={20} weight="bold" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Current Situation</h2>
              </div>
              <p className="text-lg font-medium text-slate-600 leading-relaxed italic border-l-4 border-indigo-200 pl-6 py-2">
                &ldquo;{incident.situation}&rdquo;
              </p>
            </section>

            {/* Timeline Section */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Clock size={20} weight="bold" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Incident Timeline</h2>
              </div>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                {incident.timeline.map((event) => (
                  <div key={event.id} className="relative pl-12">
                    <div className={cn(
                      "absolute left-0 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm z-10",
                      event.status === "completed" ? "bg-emerald-500" : "bg-indigo-500"
                    )}>
                      {event.status === "completed" ? (
                        <CheckCircle size={18} className="text-white" weight="bold" />
                      ) : (
                        <Circle size={10} className="text-white" weight="fill" />
                      )}
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{event.title}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{event.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-500">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Response Options */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <ShieldCheck size={20} weight="bold" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Hermes Response Options</h2>
              </div>
              <div className="grid gap-6">
                {incident.responseOptions.map((option) => (
                  <div key={option.id} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:border-indigo-100 hover:bg-indigo-50/30">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5",
                        option.priority === "high" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {option.priority} PRIORITY
                      </Badge>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {option.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{option.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-6">{option.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md">
                        APPROVE EXECUTION
                      </button>
                      <button className="rounded-xl bg-white border border-slate-200 px-6 py-2.5 text-xs font-black text-slate-600 transition-all hover:bg-slate-50">
                        MODIFY PLAN
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            {/* Affected Resources */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-tight mb-6">Affected Areas</h2>
              <div className="space-y-4">
                {incident.affectedResources.map((resource) => (
                  <div key={resource.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 bg-slate-50/30">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      resource.type === "room" ? "bg-blue-100 text-blue-600" : 
                      resource.type === "speaker" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {resource.type === "room" ? <MapPin size={20} /> : 
                       resource.type === "speaker" ? <User size={20} /> : <Calendar size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{resource.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{resource.type}</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-black uppercase tracking-tighter",
                      resource.impact === "high" ? "border-rose-200 text-rose-600" : "border-amber-200 text-amber-600"
                    )}>
                      {resource.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            {/* Risks Section */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-tight mb-6">Risk Assessment</h2>
              <div className="space-y-6">
                {incident.risks.map((risk) => (
                  <div key={risk.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{risk.title}</h3>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase",
                        risk.impact === "high" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {risk.impact} IMPACT
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      <span className="font-bold text-slate-700">Mitigation:</span> {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Communication Plan */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-tight mb-6">Comm Plan</h2>
              <div className="space-y-4">
                {incident.communications.map((comm) => (
                  <div key={comm.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Chats size={16} className="text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{comm.channel}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest">
                        {comm.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">To: {comm.audience}</p>
                    <p className="text-xs font-medium text-slate-600 italic">&ldquo;{comm.message}&rdquo;</p>
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
