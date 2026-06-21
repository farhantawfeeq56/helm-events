import Link from "next/link";
import { ArrowLeft, Heartbeat } from "@phosphor-icons/react/dist/ssr";
import { HealthDashboard } from "@/components/health/health-dashboard";

export const dynamic = "force-dynamic";

export default function HealthPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <Link
          href="/operations"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={16} weight="bold" />
          Back to Data Hub
        </Link>
        <header className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500 text-white">
            <Heartbeat size={24} weight="bold" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Operational Health</h1>
            <p className="text-slate-500">The live, at-a-glance state of your active event.</p>
          </div>
        </header>

        <HealthDashboard />
      </div>
    </div>
  );
}
