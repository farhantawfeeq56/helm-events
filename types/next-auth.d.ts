import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      team: string;
    };
  }

  interface User {
    role: string;
    team: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    team?: string;
  }
}
