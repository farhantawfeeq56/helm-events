import { NextResponse } from "next/server";
import { getActiveEvent } from "@/lib/context/contextService";
import { computeEventHealth } from "@/lib/services/health-service";

/**
 * Operational health of the active event, computed live on every request — the
 * real-time state-of-the-event view for organizers. Pure read (no snapshot
 * writes; that's the metrics route's job), so it can be polled freely.
 *
 * NB: lives under /api/operations/health, not /api/health — the latter is the
 * CRUD endpoint for the SystemHealth (infrastructure) collection.
 */
export async function GET() {
  try {
    const event = await getActiveEvent().catch(() => null);
    if (!event?._id) {
      return NextResponse.json({ success: true, eventName: null, data: null });
    }
    const data = await computeEventHealth(String(event._id), (event as { name?: string }).name || null);
    return NextResponse.json({ success: true, eventName: data.eventName, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to compute event health.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
