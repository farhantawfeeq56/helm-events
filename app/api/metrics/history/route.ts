import { NextResponse } from "next/server";
import { MetricSnapshot } from "@/models/metric-snapshot";
import { getActiveEvent } from "@/lib/context/contextService";

const RANGES: Record<string, number> = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};

/**
 * Historical metric snapshots for the active event over a time range, oldest →
 * newest, for charting trends. `range` ∈ 1h | 6h | 24h | 7d | all (default 24h).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "24h";

    const event = await getActiveEvent().catch(() => null);
    if (!event?._id) {
      return NextResponse.json({ success: true, data: [] });
    }
    const eventId = String(event._id);

    const filter: Record<string, unknown> = { eventId };
    if (range !== "all" && RANGES[range]) {
      filter.capturedAt = { $gte: new Date(Date.now() - RANGES[range]) };
    }

    const snapshots = await MetricSnapshot.find(filter)
      .sort({ capturedAt: 1 })
      .limit(1000)
      .select("capturedAt source trigger metrics")
      .lean();

    return NextResponse.json({ success: true, data: snapshots, range });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load metric history.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
