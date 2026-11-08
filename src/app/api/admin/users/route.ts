import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import { issueAndSendInvite } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      passwordHash: true,
    },
  });

  return NextResponse.json({
    ok: true,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      hasPassword: Boolean(u.passwordHash),
    })),
  });
}

const inviteSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  role: z.enum(["CLIENT", "ADMIN"]).optional().default("CLIENT"),
});

/** Admin invite: create user without password, email 7d set-password link. */
export async function POST(request: Request) {
  const admin = await getSessionUser(request);
  if (!admin) return unauthorized();
  if (admin.role !== "ADMIN") return forbidden();

  try {
    const body = inviteSchema.parse(await request.json());
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
        role: body.role,
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
        createdAt: user.createdAt,
        hasPassword: false,
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
