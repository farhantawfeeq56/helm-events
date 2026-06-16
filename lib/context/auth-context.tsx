"use client";

import { createContext, useContext } from "react";
import type { Role } from "@/lib/auth/session";

export interface AuthUser {
  email: string;
  role: Role;
  name: string;
}

const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser | null;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

/** The signed-in user, or null on public pages (e.g. /login). */
export function useAuth(): AuthUser | null {
  return useContext(AuthContext);
}
