import { NextResponse } from "next/server";
import { getActiveEvent } from "@/lib/context/contextService";
import { computeResolutionAnalytics } from "@/lib/services/analytics-service";

/**
 * Resolution analytics for the active event — incident resolution performance,
 * task execution trends, volunteer contribution, organizer workload, and Hermes
 * effectiveness. Every figure is derived from real platform records.
 */
export async function GET() {
  try {
    const event = await getActiveEvent().catch(() => null);
    if (!event?._id) {
      return NextResponse.json({ success: true, data: null });
    }
    const analytics = await computeResolutionAnalytics(
      String(event._id),
      (event as { name?: string }).name || null,
    );
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load analytics.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
