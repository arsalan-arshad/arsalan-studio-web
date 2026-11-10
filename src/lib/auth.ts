import { prisma } from "@/lib/prisma";
import { consumeBootstrapToken } from "@/lib/email-verification";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Role } from "@prisma/client";

function sessionUserFromDb(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: Date | null;
  active?: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

function isActiveUser(user: { active?: boolean } | null | undefined) {
  return user?.active !== false;
}

/** Shared by Auth.js Google callback and mobile `POST /api/auth/google`. */
export async function upsertGoogleUser(input: {
  email: string;
  name?: string | null;
  providerAccountId: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  id_token?: string | null;
  scope?: string | null;
  token_type?: string | null;
}) {
  const email = input.email.trim().toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: (input.name || email.split("@")[0] || "Client").slice(0, 120),
        passwordHash: null,
        role: "CLIENT",
        emailVerified: new Date(),
      },
    });
  } else if (!user.emailVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  }

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: input.providerAccountId,
      },
    },
    create: {
      userId: user.id,
      type: "oauth",
      provider: "google",
      providerAccountId: input.providerAccountId,
      access_token: input.access_token ?? null,
      refresh_token: input.refresh_token ?? null,
      expires_at: input.expires_at ?? null,
      id_token: input.id_token ?? null,
      scope: input.scope ?? null,
      token_type: input.token_type ?? null,
    },
    update: {
      userId: user.id,
      access_token: input.access_token ?? null,
      refresh_token: input.refresh_token ?? null,
      expires_at: input.expires_at ?? null,
      id_token: input.id_token ?? null,
      scope: input.scope ?? null,
      token_type: input.token_type ?? null,
    },
  });

  return user;
}

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Credentials + Google; JWT cookie sessions (Account table used for OAuth linking).
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            // Same verified Google email → existing User (credentials or prior Google).
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        bootstrapToken: { label: "Bootstrap", type: "text" },
      },
      async authorize(credentials) {
        const bootstrapToken = String(credentials?.bootstrapToken ?? "").trim();
        if (bootstrapToken) {
          const user = await consumeBootstrapToken(bootstrapToken);
          if (!user || !isActiveUser(user)) return null;
          return sessionUserFromDb(user);
        }

        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || !isActiveUser(user)) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return sessionUserFromDb(user);
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      const email =
        (profile as { email?: string } | undefined)?.email || user.email;
      if (!email) {
        return "/login?error=GoogleEmailMissing";
      }
      // Only trust Google when profile.email_verified is explicitly true.
      // Do not create/login as verified when Google says the email is unverified.
      const googleEmailVerified =
        (profile as { email_verified?: boolean } | undefined)?.email_verified ===
        true;
      if (!googleEmailVerified) {
        return "/login?error=GoogleEmailNotVerified";
      }

      const existing = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
        select: { active: true },
      });
      if (existing && !isActiveUser(existing)) {
        return "/login?error=AccountInactive";
      }

      const dbUser = await upsertGoogleUser({
        email,
        name: user.name,
        providerAccountId: account.providerAccountId,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        id_token: account.id_token,
        scope: account.scope,
        token_type: account.token_type,
      });
      if (!isActiveUser(dbUser)) {
        return "/login?error=AccountInactive";
      }
      user.id = dbUser.id;
      user.role = dbUser.role;
      user.email = dbUser.email;
      user.name = dbUser.name;
      user.emailVerified = dbUser.emailVerified;
      return true;
    },
    async jwt({ token, user, trigger, account }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.isEmailVerified =
          user.role === "ADMIN" ||
          user.role === "SUB_ADMIN" ||
          Boolean((user as { emailVerified?: Date | null }).emailVerified);
      }

      // Ensure Google sessions always map to our Prisma User id (not provider sub)
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
          select: {
            id: true,
            role: true,
            name: true,
            email: true,
            emailVerified: true,
            active: true,
          },
        });
        if (!dbUser || !isActiveUser(dbUser)) {
          return { ...token, id: undefined, role: undefined };
        }
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.isEmailVerified =
          dbUser.role === "ADMIN" ||
          dbUser.role === "SUB_ADMIN" ||
          Boolean(dbUser.emailVerified);
      }

      // Refresh verification / role after verify-email; drop deactivated accounts.
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: {
            emailVerified: true,
            role: true,
            name: true,
            email: true,
            active: true,
          },
        });
        if (!dbUser || !isActiveUser(dbUser)) {
          return { ...token, id: undefined, role: undefined };
        }
        token.isEmailVerified =
          dbUser.role === "ADMIN" ||
          dbUser.role === "SUB_ADMIN" ||
          Boolean(dbUser.emailVerified);
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.role = dbUser.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (!token.id) {
          // Deactivated / cleared JWT — expose no usable identity
          session.user.id = "";
          session.user.role = undefined as unknown as Role;
          session.user.name = "";
          session.user.email = "";
          session.user.isEmailVerified = false;
          return session;
        }
        session.user.id = String(token.id);
        session.user.role = token.role as Role;
        session.user.name = String(token.name ?? "");
        session.user.email = String(token.email ?? "");
        session.user.isEmailVerified = Boolean(token.isEmailVerified);
      }
      return session;
    },
  },
});
