import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { dispatchPlanTasks } from "@/lib/services/plan-dispatch";

/**
 * Turns an approved Hermes plan into real, assigned tasks (agent chat flow).
 * The heavy lifting — intelligent assignment, task creation, notifications, and
 * audit logging — lives in `dispatchPlanTasks`, shared with the dedicated
 * incident approval route so both behave identically. The approving organizer
 * is read from the session and recorded as each task's `assignedBy`.
 */
export async function POST(request: Request) {
  try {
    const { incidentSlug, planTitle, steps, priority } = await request.json();

    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    const assignedBy = session?.name || "Operations";

    const result = await dispatchPlanTasks({ incidentSlug, planTitle, steps, priority, assignedBy });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Failed to assign tasks." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      assignedBy,
      assignments: result.assignments,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to assign tasks." }, { status: 500 });
  }
}
