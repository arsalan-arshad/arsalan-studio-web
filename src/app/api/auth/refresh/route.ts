import { toPublicUser } from "@/lib/auth-helpers";
import {
  clientMetaFromRequest,
  rotateRefreshToken,
} from "@/lib/refresh-token";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  refreshToken: z.string().min(1),
});

/**
 * Exchange a refresh token for a new access + refresh pair (rotation).
 * Body only — never put refresh tokens in query strings.
 */
export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await rotateRefreshToken(
      body.refreshToken,
      clientMetaFromRequest(request),
    );
    if (!result) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired refresh token" },
        { status: 401 },
      );
    }

    const { user, bundle } = result;
    return NextResponse.json({
      ok: true,
      user: toPublicUser(user),
      accessToken: bundle.accessToken,
      refreshToken: bundle.refreshToken,
      expiresIn: bundle.expiresIn,
      token: bundle.accessToken,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[refresh]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
