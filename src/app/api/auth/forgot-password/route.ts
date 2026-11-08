import { prisma } from "@/lib/prisma";
import {
  canRequestPasswordReset,
  issueAndSendPasswordReset,
} from "@/lib/password-reset";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(200),
});

/**
 * Always returns ok to avoid email enumeration.
 * Only sends when the account has a local password (not Google-only).
 */
export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.passwordHash) {
      const cooldown = await canRequestPasswordReset(user.id);
      if (cooldown.ok) {
        try {
          await issueAndSendPasswordReset(user);
        } catch (err) {
          console.error("[forgot-password] send failed", err);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists for that email, a reset link is on its way.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    console.error("[forgot-password]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
