import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Role } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Credentials + JWT only (no OAuth adapter models required).
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.isEmailVerified =
          user.role === "ADMIN" ||
          Boolean((user as { emailVerified?: Date | null }).emailVerified);
      }

      // Refresh verification flag after verify-email or resend flows
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { emailVerified: true, role: true, name: true, email: true },
        });
        if (dbUser) {
          token.isEmailVerified =
            dbUser.role === "ADMIN" || Boolean(dbUser.emailVerified);
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.role = token.role as Role;
        session.user.name = String(token.name ?? "");
        session.user.email = String(token.email ?? "");
        session.user.isEmailVerified = Boolean(token.isEmailVerified);
      }
      return session;
    },
  },
});
