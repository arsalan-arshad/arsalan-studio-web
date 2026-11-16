import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import { issueAndSendInvite } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import {
  canInviteRole,
  canListUsers,
  inviteableRoles,
  isAdmin,
} from "@/lib/roles";
import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!canListUsers(user.role)) return forbidden();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      emailVerified: true,
      country: true,
      city: true,
      image: true,
      lastLoginAt: true,
      lastSeenAt: true,
      createdAt: true,
      passwordHash: true,
      accounts: {
        select: { provider: true },
      },
      threads: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          id: true,
          reminderEmailSentAt: true,
        },
      },
      _count: { select: { threads: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    canDelete: isAdmin(user.role),
    canToggleActive: isAdmin(user.role),
    canStartConversation: isAdmin(user.role),
    inviteRoles: inviteableRoles(user.role),
    users: users.map((u) => {
      const hasPassword = Boolean(u.passwordHash);
      const hasGoogle = u.accounts.some((a) => a.provider === "google");
      const accountType = accountTypeFrom(hasPassword, hasGoogle);
      const latestThread = u.threads[0] ?? null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active,
        emailVerified: u.emailVerified?.toISOString() ?? null,
        country: u.country,
        city: u.city,
        image: u.image,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        lastSeenAt: u.lastSeenAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
        hasPassword,
        hasGoogle,
        accountType,
        accountTypeLabel: accountTypeLabel(accountType),
        threadCount: u._count.threads,
        threadId: latestThread?.id ?? null,
        reminderEmailSentAt:
          latestThread?.reminderEmailSentAt?.toISOString() ?? null,
      };
    }),
  });
}

/** How the user can sign in: local password, Google OAuth, both, or invite-only. */
type AccountType = "password" | "google" | "both" | "none";

function accountTypeFrom(hasPassword: boolean, hasGoogle: boolean): AccountType {
  if (hasPassword && hasGoogle) return "both";
  if (hasPassword) return "password";
  if (hasGoogle) return "google";
  return "none";
}

function accountTypeLabel(type: AccountType): string {
  switch (type) {
    case "both":
      return "Password + Google";
    case "password":
      return "Password";
    case "google":
      return "Google";
    case "none":
      return "Invite pending";
  }
}

const inviteSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  role: z.enum(["CLIENT", "ADMIN", "SUB_ADMIN"]).optional().default("CLIENT"),
});

/** Staff invite: create user without password, email 7d set-password link. */
export async function POST(request: Request) {
  const actor = await getSessionUser(request);
  if (!actor) return unauthorized();
  if (!canListUsers(actor.role)) return forbidden();

  try {
    const body = inviteSchema.parse(await request.json());
    if (!canInviteRole(actor.role, body.role)) {
      return forbidden(
        isAdmin(actor.role)
          ? "Cannot assign that role"
          : "Support can invite CLIENT or SUB_ADMIN only",
      );
    }

    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 },
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        role: body.role as Role,
        passwordHash: null,
        emailVerified: null,
      },
    });

    let invite: { sent: boolean; setUrl?: string; reason?: string } = {
      sent: false,
    };
    try {
      invite = await issueAndSendInvite(user);
    } catch (err) {
      console.error("[admin/users] invite email failed", err);
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        country: user.country,
        city: user.city,
        createdAt: user.createdAt.toISOString(),
        hasPassword: false,
        hasGoogle: false,
        accountType: "none" as const,
        accountTypeLabel: "Invite pending",
      },
      inviteSent: invite.sent,
      // Dev-friendly when RESEND_API_KEY is unset
      inviteUrl: invite.sent ? undefined : invite.setUrl,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: err.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }
    console.error("[admin/users POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
