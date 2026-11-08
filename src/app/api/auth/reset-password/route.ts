import { getSessionUser } from "@/lib/auth-helpers";
import {
  completePasswordReset,
  peekPasswordResetToken,
} from "@/lib/password-reset";
import { strongPasswordSchema } from "@/lib/password";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  token: z.string().trim().min(10).max(200),
  password: strongPasswordSchema,
});

/** Peek token owner (no consume) so the UI can block wrong-session misuse. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token || token.length < 10) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }
  const result = await peekPasswordResetToken(token);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }
  return NextResponse.json({
    ok: true,
    userId: result.userId,
    email: result.email,
    name: result.name,
    purpose: result.purpose,
  });
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const peek = await peekPasswordResetToken(body.token);
    if (!peek.ok) {
      return NextResponse.json(
        { ok: false, error: peek.error },
        { status: 400 },
      );
    }

    const sessionUser = await getSessionUser(request);
    if (sessionUser && sessionUser.id !== peek.userId) {
      return NextResponse.json(
        {
          ok: false,
          error: `You’re signed in as ${sessionUser.email}. Log out to finish this link for ${peek.email}.`,
          code: "SESSION_MISMATCH",
          sessionEmail: sessionUser.email,
          targetEmail: peek.email,
        },
        { status: 403 },
      );
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const result = await completePasswordReset(body.token, passwordHash);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({
      ok: true,
      email: result.user.email,
      purpose: result.purpose,
      bootstrapToken: result.bootstrapToken,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const msg =
        err.issues[0]?.message ||
        "Password does not meet strength requirements";
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
    console.error("[reset-password]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
