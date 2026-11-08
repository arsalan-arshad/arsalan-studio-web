import { completePasswordReset } from "@/lib/password-reset";
import { strongPasswordSchema } from "@/lib/password";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  token: z.string().trim().min(10).max(200),
  password: strongPasswordSchema,
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const passwordHash = await bcrypt.hash(body.password, 12);
    const result = await completePasswordReset(body.token, passwordHash);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true, email: result.user.email });
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
