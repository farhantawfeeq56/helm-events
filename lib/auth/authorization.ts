import { NextResponse } from "next/server";
import type { Session } from "next-auth";

import { getAuthSession } from "@/lib/auth";

export type HelmRole = "volunteer" | "organizer" | "admin";

export type AuthorizedUser = Session["user"] & {
  id: string;
  role: HelmRole;
  team: string;
};

type AuthorizedContext = {
  request: Request;
  session: Session;
  user: AuthorizedUser;
};

type AuthorizedHandler = (
  context: AuthorizedContext,
) => Promise<NextResponse> | NextResponse;

function isHelmRole(role: string): role is HelmRole {
  return role === "volunteer" || role === "organizer" || role === "admin";
}

export function withRoleAuthorization(
  allowedRoles: HelmRole[],
  handler: AuthorizedHandler,
) {
  return async function authorizedRoute(request: Request) {
    const session = await getAuthSession();
    const sessionUser = session?.user;

    if (!sessionUser || !isHelmRole(sessionUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      sessionUser.role !== "admin" &&
      !allowedRoles.includes(sessionUser.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler({
      request,
      session,
      user: sessionUser as AuthorizedUser,
    });
  };
}
