import Link from "next/link";
import { notFound } from "next/navigation";
import { getIncidentById } from "@/lib/repositories/incident-repository";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle,
  Circle,
  Pulse
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Situation } from "@/components/operations/incident/situation";
import { Impact } from "@/components/operations/incident/impact";
import { ResponseOptions } from "@/components/operations/incident/response-options";
import { Risks } from "@/components/operations/incident/risks";
import { Communications } from "@/components/operations/incident/communications";
import { IncidentClientLoader } from "./incident-client-loader";

export const dynamic = "force-dynamic";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const incident = await getIncidentById(incidentId);

  if (!incident) {
    return <IncidentClientLoader incidentId={incidentId} />;
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

  const getCategory = (id: string) => {
    if (id.includes("speaker")) return "Speaker Operations";
    if (id.includes("internet") || id.includes("wifi")) return "Infrastructure";
    if (id.includes("sponsor")) return "Partner Relations";
    if (id.includes("volunteer")) return "Staffing";
    if (id.includes("room")) return "Logistics";
    return "General Operations";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-6 py-10 text-slate-900">
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
          <div className="lg:col-span-2 space-y-12">
            
            <Situation situation={incident.situation} />

            <ResponseOptions
              options={incident.responseOptions}
              incidentId={incident.id}
              executionStatus={incident.executionStatus}
            />

            <Impact 
              affectedResources={incident.affectedResources} 
              impactAnalysis={incident.impactAnalysis} 
            />

            <Communications communications={incident.communications} />

            {/* Timeline Section */}
            {incident.timeline && incident.timeline.length > 0 && <section>
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
            </section>}
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

            <Risks assessment={incident.riskAssessment} detailedRisks={incident.risks} />
          </div>
        </div>
      </div>
    </div>
  );
}
