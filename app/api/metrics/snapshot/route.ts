import { NextResponse } from "next/server";
import { getActiveEvent } from "@/lib/context/contextService";
import { recordSnapshot } from "@/lib/services/metrics-service";
import { logActivity } from "@/lib/activity-logger";

/** Manually captures a metric snapshot for the active event (organizer action). */
export async function POST() {
  try {
    const event = await getActiveEvent().catch(() => null);
    if (!event?._id) {
      return NextResponse.json({ success: false, error: "No active event configured." }, { status: 400 });
    }
    const eventId = String(event._id);
    const snapshot = await recordSnapshot(eventId, { source: "manual", trigger: "manual_capture" });

    await logActivity({
      user: "Operations",
      type: "human",
      action: "metrics_snapshot",
      target: "metrics",
      details: `Captured a performance snapshot for ${(event as { name?: string }).name || "the active event"}.`,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: snapshot });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to capture snapshot.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
