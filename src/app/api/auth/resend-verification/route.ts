import {
  canResendVerification,
  issueAndSendVerification,
} from "@/lib/email-verification";
import { getSessionUser, unauthorized } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().trim().email().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser(request);
    const json = await request.json().catch(() => ({}));
    const body = bodySchema.parse(json);

    let user =
      sessionUser &&
      (await prisma.user.findUnique({ where: { id: sessionUser.id } }));

    if (!user && body.email) {
      user = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() },
      });
    }

    // Always return generic success when email unknown (avoid enumeration)
    if (!user) {
      if (!sessionUser && !body.email) return unauthorized();
      return NextResponse.json({
        ok: true,
        message: "If an account exists, a verification email was sent.",
      });
    }

    if (user.role === "ADMIN" || user.role === "SUB_ADMIN" || user.emailVerified) {
      return NextResponse.json({
        ok: true,
        message: "Email already verified.",
        alreadyVerified: true,
      });
    }

    const cooldown = await canResendVerification(user.id);
    if (!cooldown.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Please wait ${cooldown.retryAfterSec}s before resending`,
          retryAfterSec: cooldown.retryAfterSec,
        },
        { status: 429 },
      );
    }

    try {
      await issueAndSendVerification(user);
    } catch (err) {
      console.error("[resend-verification] send failed", err);
      return NextResponse.json(
        { ok: false, error: "Could not send email" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Verification email sent.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[resend-verification]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
