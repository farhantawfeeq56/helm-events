import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Sponsor } from "@/models/sponsor";
import { logActivity } from "@/lib/activity-logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const sponsor = await Sponsor.findById(id);
    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: sponsor });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch sponsor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = await request.json();
    const sponsor = await Sponsor.findByIdAndUpdate(id, payload, {
      new: true,
    });
    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "update",
      target: "sponsor",
      details: `Updated sponsor: ${sponsor.companyName}`,
    });

    return NextResponse.json({ success: true, data: sponsor });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update sponsor" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const sponsor = await Sponsor.findByIdAndDelete(id);
    if (!sponsor) {
      return NextResponse.json(
        { success: false, error: "Sponsor not found" },
        { status: 404 }
      );
    }

    await logActivity({
      user: "Admin",
      type: "human",
      action: "delete",
      target: "sponsor",
      details: `Deleted sponsor: ${sponsor.companyName}`,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete sponsor" },
      { status: 500 }
    );
  }
}
