import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import { strongPasswordSchema } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/roles";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPasswordSchema,
});

/**
 * PATCH — change own password (ADMIN / SUB_ADMIN only).
 * Requires an existing local passwordHash (Google-only accounts cannot use this).
 */
export async function PATCH(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!isStaff(user.role)) return forbidden();

  try {
    const body = schema.parse(await request.json());
    if (body.currentPassword === body.newPassword) {
      return NextResponse.json(
        { ok: false, error: "New password must differ from the current password" },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.passwordHash) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This account has no local password (Google sign-in only). Set one via forgot-password after linking email, or ask an admin.",
        },
        { status: 400 },
      );
    }

    const ok = await bcrypt.compare(body.currentPassword, dbUser.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: err.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }
    console.error("[admin/password PATCH]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
