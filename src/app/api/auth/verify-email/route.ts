import { verifyEmailToken } from "@/lib/email-verification";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  token: z.string().trim().min(10).max(200),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await verifyEmailToken(body.token);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({
      ok: true,
      email: result.user.email,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 400 });
    }
    console.error("[verify-email]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });
  }
  const result = await verifyEmailToken(token);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, email: result.user.email });
}
