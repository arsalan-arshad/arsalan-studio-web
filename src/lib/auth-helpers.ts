import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken } from "@/lib/mobile-token";
import type { Role, User } from "@prisma/client";
import { NextResponse } from "next/server";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export async function getSessionUser(
  request?: Request,
): Promise<SessionUser | null> {
  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  }

  if (!request) return null;
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const payload = await verifyMobileToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ ok: false, error: message }, { status: 403 });
}

export function requireAdmin(user: SessionUser | null) {
  return Boolean(user && user.role === "ADMIN");
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
