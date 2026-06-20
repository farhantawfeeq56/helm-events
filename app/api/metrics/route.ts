import { NextResponse } from "next/server";
import { MetricSnapshot } from "@/models/metric-snapshot";
import { getActiveEvent } from "@/lib/context/contextService";
import { computeEventMetrics, maybeRecordSnapshot } from "@/lib/services/metrics-service";

/**
 * Current operational metrics for the active event, computed live, plus the most
 * recent stored snapshot (so the UI can show change-since-last). Reading also
 * opportunistically captures a snapshot — throttled to once / 5 min — so history
 * keeps building as the platform is used, without needing a cron.
 */
export async function GET() {
  try {
    const event = await getActiveEvent().catch(() => null);
    if (!event?._id) {
      return NextResponse.json({ success: true, data: null });
    }
    const eventId = String(event._id);

    const current = await computeEventMetrics(eventId);

    const previous = (await MetricSnapshot.findOne({ eventId })
      .sort({ capturedAt: -1 })
      .lean()) as { metrics?: unknown; capturedAt?: Date } | null;

    // Passive history capture (throttled). Awaited but cheap when skipped.
    await maybeRecordSnapshot(eventId, { trigger: "view", source: "auto", minIntervalMs: 5 * 60 * 1000 });

    return NextResponse.json({
      success: true,
      eventId,
      eventName: (event as { name?: string }).name || null,
      current,
      previous: previous?.metrics || null,
      previousAt: previous?.capturedAt || null,
      capturedAt: new Date(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load metrics.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
