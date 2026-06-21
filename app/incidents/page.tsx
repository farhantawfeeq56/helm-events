import Link from "next/link";
import { getAllIncidents } from "@/lib/repositories/incident-repository";
import { 
  CaretRight, 
  Warning, 
  Clock, 
  Info,
  Circle
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  const incidents = await getAllIncidents();

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
    <div className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Incidents
            </h1>
            <p className="text-lg text-slate-500 font-medium">
              Real-time operational awareness and incident response.
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          {incidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/incidents/${incident.id}`}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4 sm:items-center">
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  incident.severity === "Critical" ? "bg-rose-50 text-rose-600" : 
                  incident.severity === "High" ? "bg-orange-50 text-orange-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  <Warning size={28} weight="duotone" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {incident.title}
                    </h3>
                    <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-wider", getSeverityColor(incident.severity))}>
                      {incident.severity}
                    </Badge>
                  </div>
                  <p className="line-clamp-1 text-sm text-slate-500 max-w-xl font-medium">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock size={14} weight="bold" />
                      <span>{incident.timestamp}</span>
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-xs font-bold", getStatusColor(incident.status))}>
                      <Circle size={8} weight="fill" />
                      <span className="uppercase tracking-wide">{incident.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between sm:mt-0">
                {/* Real signal: areas the agent flagged as impacted for this incident. */}
                {incident.impactAnalysis && incident.impactAnalysis.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Info size={14} weight="bold" />
                    <span>
                      {incident.impactAnalysis.length} area{incident.impactAnalysis.length > 1 ? "s" : ""} impacted
                    </span>
                  </div>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2 text-sm font-black text-indigo-600 transition-transform group-hover:translate-x-1 sm:ml-8">
                  DETAILS
                  <CaretRight size={16} weight="bold" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
