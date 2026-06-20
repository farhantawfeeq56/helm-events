import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Incident } from "@/models/incident";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { dispatchPlanTasks } from "@/lib/services/plan-dispatch";
import type { RecommendedAction, ChecklistItem } from "@/lib/hermes";

/**
 * Approve (or modify-and-approve) a response option on an incident.
 *
 * Body: `{ optionId: number, modified?: boolean, steps?: ChecklistItem[] }`.
 *
 * Persists the decision into `incident.analysis`: the chosen option's status
 * becomes `approved` (or `modified`), the executionStatus headline is updated,
 * and the plan's steps are dispatched as real assigned tasks (shared engine
 * with the agent chat flow). Once an option is approved the dedicated incident
 * page hides the option list and shows only the active response.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const optionId = Number(body?.optionId);
    const modified = Boolean(body?.modified);
    const overrideSteps: ChecklistItem[] | undefined = Array.isArray(body?.steps)
      ? body.steps
      : undefined;

    if (!Number.isFinite(optionId)) {
      return NextResponse.json(
        { success: false, error: "optionId is required" },
        { status: 400 }
      );
    }

    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    const actor = session?.name || "Operations";

    // Resolve incident by slug first, then ObjectId.
    let incident = await Incident.findOne({ slug: id });
    if (!incident && Types.ObjectId.isValid(id)) {
      incident = await Incident.findById(id);
    }
    if (!incident) {
      return NextResponse.json({ success: false, error: "Incident not found" }, { status: 404 });
    }

    const analysis = (incident.analysis ?? {}) as {
      responseOptions?: RecommendedAction[];
      executionStatus?: string;
    };
    const options = Array.isArray(analysis.responseOptions) ? analysis.responseOptions : [];
    const chosen = options.find((o) => o.id === optionId);

    if (!chosen) {
      return NextResponse.json(
        { success: false, error: "Response option not found on this incident" },
        { status: 404 }
      );
    }

    // Apply any operator modifications to the plan steps before dispatch.
    if (modified && overrideSteps && overrideSteps.length > 0) {
      chosen.steps = overrideSteps;
    }

    // Mark the chosen option, leave the rest pending (the UI hides them).
    const decisionStatus: RecommendedAction["status"] = modified ? "modified" : "approved";
    for (const o of options) {
      o.status = o.id === optionId ? decisionStatus : o.status;
    }

    const headline = `${modified ? "Modified plan" : "Plan"} approved by ${actor}: ${chosen.title}. Dispatching response.`;
    analysis.responseOptions = options;
    analysis.executionStatus = headline;
    incident.analysis = analysis;
    incident.markModified("analysis");
    if ((incident.status || "").toLowerCase() === "open") {
      incident.status = "investigating";
    }
    await incident.save();

    // Dispatch the plan steps as real assigned tasks linked to this incident.
    const dispatch = await dispatchPlanTasks({
      incidentSlug: incident.slug,
      planTitle: chosen.title,
      steps: chosen.steps ?? [],
      priority: chosen.priority,
      assignedBy: actor,
    });

    return NextResponse.json({
      success: true,
      optionId,
      decision: decisionStatus,
      executionStatus: headline,
      dispatched: dispatch.count,
      assignments: dispatch.assignments,
      dispatchError: dispatch.success ? undefined : dispatch.error,
    });
  } catch (error) {
    console.error("POST /api/incidents/[id]/approve failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to approve response option" },
      { status: 500 }
    );
  }
}
