import {
  revokeAllRefreshTokens,
  revokeRefreshToken,
} from "@/lib/refresh-token";
import { getSessionUser } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  refreshToken: z.string().min(1).optional(),
  /** When true and caller is authenticated, revoke every refresh token for that user. */
  all: z.boolean().optional(),
});

/** Revoke refresh token(s). Auth.js cookie sessions are unaffected. */
export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json().catch(() => ({})));

    if (body.all) {
      const user = await getSessionUser(request);
      if (!user) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      }
      await revokeAllRefreshTokens(user.id);
      return NextResponse.json({ ok: true });
    }

    if (!body.refreshToken) {
      return NextResponse.json(
        { ok: false, error: "refreshToken required (or all: true with Bearer/session)" },
        { status: 400 },
      );
    }

    await revokeRefreshToken(body.refreshToken);
    // Always ok — don't leak whether the token existed
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[logout]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
