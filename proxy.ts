import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

const VOLUNTEER_PREFIX = "/volunteer";

function isVolunteerRoute(pathname: string): boolean {
  return pathname === VOLUNTEER_PREFIX || pathname.startsWith(VOLUNTEER_PREFIX + "/");
}

/**
 * Enforces authentication and role-based access:
 *  - unauthenticated requests are redirected to /login
 *  - volunteers may only see /volunteer/* pages
 *  - organizers may only see the organizer pages (everything else)
 * API routes only require a valid session (no role gating, so each side can
 * still fetch its data). The /api/auth/* endpoints are always public.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth endpoints must stay open so users can log in / out.
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const isLogin = pathname === "/login";

  // Not signed in → only the login page is reachable.
  if (!session) {
    if (isLogin) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname && pathname !== "/" ? `?from=${encodeURIComponent(pathname)}` : "";
    return NextResponse.redirect(url);
  }

  // Signed in → bounce away from the login page to the role's home.
  if (isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = session.role === "organizer" ? "/" : "/volunteer";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Role-based gating for page routes only.
  if (!pathname.startsWith("/api")) {
    const volunteerRoute = isVolunteerRoute(pathname);
    if (session.role === "volunteer" && !volunteerRoute) {
      const url = req.nextUrl.clone();
      url.pathname = "/volunteer";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (session.role === "organizer" && volunteerRoute) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)).*)",
  ],
};
