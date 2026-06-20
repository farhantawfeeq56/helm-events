import Link from "next/link";
import { ArrowLeft, Gauge } from "@phosphor-icons/react/dist/ssr";
import { MetricsOverview } from "@/components/metrics/metrics-overview";

export const dynamic = "force-dynamic";

export default function MetricsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <Link
          href="/operations"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
        >
          <ArrowLeft size={16} weight="bold" />
          Back to Data Hub
        </Link>

        <header className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Gauge size={24} weight="bold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
            <p className="text-slate-500">How the event operation is performing over time.</p>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <MetricsOverview />
        </div>
      </div>
    </div>
  );
}
