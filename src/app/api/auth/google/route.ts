import { upsertGoogleUser } from "@/lib/auth";
import { toPublicUser } from "@/lib/auth-helpers";
import {
  clientMetaFromRequest,
  issueTokenBundle,
} from "@/lib/refresh-token";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  idToken: z.string().trim().min(20).max(8000),
});

type GoogleTokenInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  iss?: string;
};

function allowedAudiences() {
  const ids = [
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_IOS_ID,
    process.env.AUTH_GOOGLE_ANDROID_ID,
    process.env.AUTH_GOOGLE_EXPO_ID,
    ...(process.env.AUTH_GOOGLE_CLIENT_IDS?.split(",") ?? []),
  ]
    .map((v) => v?.trim())
    .filter(Boolean) as string[];
  return new Set(ids);
}

async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo | null> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );
  if (!res.ok) return null;
  const payload = (await res.json()) as GoogleTokenInfo;
  const aud = payload.aud;
  if (!aud || !allowedAudiences().has(aud)) return null;
  const issuerOk =
    payload.iss === "https://accounts.google.com" ||
    payload.iss === "accounts.google.com";
  if (!issuerOk) return null;
  const verified =
    payload.email_verified === true || payload.email_verified === "true";
  if (!verified || !payload.email || !payload.sub) return null;
  return payload;
}

/**
 * Mobile Google sign-in — verifies a Google ID token and returns Bearer tokens
 * (same shape as `/api/auth/token`). Web Auth.js Google remains cookie-based.
 */
export async function POST(request: Request) {
  try {
    if (!process.env.AUTH_GOOGLE_ID && !process.env.AUTH_GOOGLE_CLIENT_IDS) {
      return NextResponse.json(
        { ok: false, error: "Google sign-in is not configured on the server" },
        { status: 503 },
      );
    }

    const body = schema.parse(await request.json());
    const info = await verifyGoogleIdToken(body.idToken);
    if (!info?.email || !info.sub) {
      return NextResponse.json(
        { ok: false, error: "Invalid Google token" },
        { status: 401 },
      );
    }

    const user = await upsertGoogleUser({
      email: info.email,
      name: info.name,
      providerAccountId: info.sub,
      id_token: body.idToken,
    });

    const bundle = await issueTokenBundle(user, clientMetaFromRequest(request));

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
    console.error("[auth/google]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
