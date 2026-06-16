import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Organizer } from "@/models/organizer";
import { Volunteer } from "@/models/volunteer";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, type Role } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-logger";

const DEFAULT_PASSWORD = "Test@123";

/**
 * Email + password login. The email is looked up in the organizers collection
 * first, then volunteers — whichever owns the email determines the workspace
 * role. Legacy records without a stored password fall back to the shared demo
 * password so existing profiles can log in immediately.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    await connectToDatabase();
    const normalizedEmail = String(email).trim().toLowerCase();

    let role: Role | null = null;
    let name = "";
    let stored: string | undefined;

    type AccountDoc = { fullName?: string; password?: string } | null;

    const organizer = (await Organizer.findOne({ email: normalizedEmail })
      .select("+password")
      .lean()) as AccountDoc;
    if (organizer) {
      role = "organizer";
      name = organizer.fullName ?? "";
      stored = organizer.password;
    } else {
      const volunteer = (await Volunteer.findOne({ email: normalizedEmail })
        .select("+password")
        .lean()) as AccountDoc;
      if (volunteer) {
        role = "volunteer";
        name = volunteer.fullName ?? "";
        stored = volunteer.password;
      }
    }

    if (!role) {
      return NextResponse.json({ success: false, error: "No account found for that email." }, { status: 401 });
    }

    const expected = stored || DEFAULT_PASSWORD;
    if (password !== expected) {
      return NextResponse.json({ success: false, error: "Incorrect password." }, { status: 401 });
    }

    const token = await createSessionToken({ email: normalizedEmail, role, name });
    const redirect = role === "organizer" ? "/" : "/volunteer";

    const response = NextResponse.json({ success: true, role, name, redirect });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    await logActivity({
      user: name,
      type: "human",
      action: "login",
      target: role,
      details: `${role} signed in (${normalizedEmail})`,
    }).catch(() => {});

    return response;
  } catch {
    return NextResponse.json({ success: false, error: "Login failed. Please try again." }, { status: 500 });
  }
}
