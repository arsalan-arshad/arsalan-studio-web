import { prisma } from "@/lib/prisma";
import { toPublicUser } from "@/lib/auth-helpers";
import { signMobileToken } from "@/lib/mobile-token";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

/** Mobile / API login — returns Bearer JWT. */
export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = signMobileToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      ok: true,
      user: toPublicUser(user),
      token,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[token]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
