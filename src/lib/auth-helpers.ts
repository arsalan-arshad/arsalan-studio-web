import { auth } from "@/lib/auth";
import { isEmailVerified } from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-token";
import { canAccessClientChat, isAdmin, isStaff } from "@/lib/roles";
import type { Role, User } from "@prisma/client";
import { NextResponse } from "next/server";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
};

export async function getSessionUser(
  request?: Request,
): Promise<SessionUser | null> {
  const session = await auth();
  if (session?.user?.id) {
    // Prefer live DB flag so verify-email takes effect without re-login
    const db = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailVerified: true,
        role: true,
        email: true,
        name: true,
        active: true,
      },
    });
    if (!db || !db.active) return null;
    return {
      id: session.user.id,
      email: db.email,
      name: db.name,
      role: db.role,
      emailVerified: isEmailVerified(db),
    };
  }

  if (!request) return null;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const payload = await verifyMobileToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.active) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: isEmailVerified(user),
  };
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ ok: false, error: message }, { status: 403 });
}

export function emailUnverified() {
  return NextResponse.json(
    {
      ok: false,
      error: "Email not verified",
      code: "EMAIL_NOT_VERIFIED",
    },
    { status: 403 },
  );
}

/** Gate client chat mutations/reads until email is verified. Staff pass. */
export function requireVerifiedEmail(user: SessionUser) {
  if (isStaff(user.role)) return null;
  if (user.emailVerified) return null;
  return emailUnverified();
}

export function requireAdmin(user: SessionUser | null) {
  return Boolean(user && isAdmin(user.role));
}

export function requireStaff(user: SessionUser | null) {
  return Boolean(user && isStaff(user.role));
}

/** CLIENT (own threads) or ADMIN. SUB_ADMIN must never pass. */
export function requireChatAccess(user: SessionUser | null) {
  return Boolean(user && canAccessClientChat(user.role));
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: Boolean(user.emailVerified) || isStaff(user.role),
  };
}
