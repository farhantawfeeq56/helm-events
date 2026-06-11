import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Helm Login",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        if (!email) {
          return null;
        }

        await connectToDatabase();
        const user = await User.findOne({ email }).lean();

        if (!user) {
          return null;
        }

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          team: user.team,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.team = user.team;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.role = typeof token.role === "string" ? token.role : "";
        session.user.team = typeof token.team === "string" ? token.team : "";
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
