import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Shift } from "@/models/shift";
import { logActivity } from "@/lib/activity-logger";
import { sendNotification } from "@/lib/notification-service";
import { validateShift } from "@/lib/validation/integrity";
import { errorResponse } from "@/lib/validation/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const shift = await Shift.findById(id).populate("eventId");
    if (!shift) {
      return NextResponse.json({ success: false, error: "Shift not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: shift });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch shift" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = await request.json();

    const oldShift = await Shift.findById(id);
    if (!oldShift) {
      return NextResponse.json({ success: false, error: "Shift not found" }, { status: 404 });
    }

    await validateShift(payload, { id, existing: oldShift.toObject() });

    const shift = await Shift.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      context: "query",
    });
    if (!shift) {
      return NextResponse.json({ success: false, error: "Shift not found" }, { status: 404 });
    }

    // Specific audit detail: reassignment, status change, or generic edit.
    let details = `Updated shift "${shift.title}".`;
    if (payload.assignedTo !== undefined && payload.assignedTo !== oldShift.assignedTo) {
      details =
        `Reassigned shift "${shift.title}" from ${oldShift.assignedTo || "Unassigned"} to ${shift.assignedTo || "Unassigned"}` +
        (shift.startTime ? ` · ${shift.startTime}–${shift.endTime || ""}` : "") +
        (shift.location ? ` · ${shift.location}` : "");
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
    } else if (payload.status && payload.status !== oldShift.status) {
      details = `Shift "${shift.title}" marked ${shift.status}` + (shift.assignedTo ? ` · ${shift.assignedTo}` : "");
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "update",
      target: `shift:${shift._id}`,
      details,
    });

    return NextResponse.json({ success: true, data: shift });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const shift = await Shift.findByIdAndDelete(id);
    if (!shift) {
      return NextResponse.json({ success: false, error: "Shift not found" }, { status: 404 });
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "delete",
      target: `shift:${shift._id}`,
      details: `Deleted shift "${shift.title}"${shift.assignedTo ? ` (was assigned to ${shift.assignedTo})` : ""}`,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete shift" }, { status: 500 });
  }
}
