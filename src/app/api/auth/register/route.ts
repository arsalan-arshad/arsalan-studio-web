import { prisma } from "@/lib/prisma";
import { toPublicUser } from "@/lib/auth-helpers";
import { signMobileToken } from "@/lib/mobile-token";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(128),
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
      },
    });

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
      return NextResponse.json(
        { ok: false, error: "Invalid input", details: err.flatten() },
        { status: 400 },
      );
    }
    console.error("[register]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
