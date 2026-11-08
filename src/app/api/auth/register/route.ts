import { prisma } from "@/lib/prisma";
import { toPublicUser } from "@/lib/auth-helpers";
import { issueAndSendVerification } from "@/lib/email-verification";
import {
  clientMetaFromRequest,
  issueTokenBundle,
} from "@/lib/refresh-token";
import { strongPasswordSchema } from "@/lib/password";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  password: strongPasswordSchema,
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        passwordHash,
        role: "CLIENT",
        emailVerified: null,
      },
    });

    try {
      await issueAndSendVerification(user);
    } catch (err) {
      console.error("[register] verification email failed", err);
    }

    const bundle = await issueTokenBundle(user, clientMetaFromRequest(request));

    return NextResponse.json({
      ok: true,
      user: toPublicUser(user),
      accessToken: bundle.accessToken,
      refreshToken: bundle.refreshToken,
      expiresIn: bundle.expiresIn,
      // Deprecated alias — prefer accessToken
      token: bundle.accessToken,
      needsEmailVerification: true,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const msg = err.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { ok: false, error: msg, details: err.flatten() },
        { status: 400 },
      );
    }
    console.error("[register]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
