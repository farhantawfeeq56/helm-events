import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Shift } from "@/models/shift";
import { logActivity } from "@/lib/activity-logger";
import { getPaginatedResponse } from "@/lib/utils";
import { sendNotification } from "@/lib/notification-service";
import { validateShift } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    // Sort chronologically by day then start time so a roster reads naturally;
    // `?assignedTo=` (volunteer view), `?eventId=`, search are handled generically.
    return getPaginatedResponse(
      Shift,
      request,
      {},
      ["title", "assignedTo", "location", "role", "description"],
      ["eventId"],
      { date: 1, startTime: 1 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch shifts.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const payload = await request.json();
    await validateShift(payload);
    const shift = await Shift.create(payload);

    await logActivity({
      user: "Admin",
      type: "human",
      action: "create",
      target: `shift:${shift._id}`,
      details:
        `Created shift "${shift.title}"` +
        (shift.date || shift.startTime ? ` for ${shift.date || "today"} ${shift.startTime || ""}–${shift.endTime || ""}` : "") +
        (shift.location ? ` at ${shift.location}` : "") +
        (shift.assignedTo ? ` · Assigned to ${shift.assignedTo}` : " · Unassigned"),
    });

    if (shift.assignedTo) {
      await sendNotification({
        recipient: shift.assignedTo,
        type: "task_assigned",
        title: "New Shift Assigned",
        message:
          `You have a shift: ${shift.title}` +
          (shift.startTime ? ` (${shift.startTime}–${shift.endTime || ""})` : "") +
          (shift.location ? ` at ${shift.location}` : ""),
        priority: "medium",
        sourceId: shift._id.toString(),
        link: "/volunteer/shifts",
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: shift }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
