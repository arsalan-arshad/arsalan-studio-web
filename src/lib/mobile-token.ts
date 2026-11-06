import { createHmac, timingSafeEqual } from "crypto";

/**
 * Access tokens for mobile / Bearer API clients.
 * Lifetime: 1 hour (see ACCESS_TOKEN_TTL_SECONDS). Refresh tokens are separate
 * opaque values stored hashed in RefreshToken — not JWTs.
 */
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
  /** Distinguishes access JWTs from any future JWT types; never a refresh token. */
  typ: "access";
  exp: number;
};

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return s;
}

function b64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromB64url(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signMobileToken(
  payload: Omit<TokenPayload, "exp" | "typ">,
  ttlSeconds = ACCESS_TOKEN_TTL_SECONDS,
) {
  const body: TokenPayload = {
    ...payload,
    typ: "access",
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const mid = b64url(JSON.stringify(body));
  const data = `${header}.${mid}`;
  const sig = createHmac("sha256", secret()).update(data).digest();
  return `${data}.${b64url(sig)}`;
}

export async function verifyMobileToken(
  token: string,
): Promise<Omit<TokenPayload, "typ"> & { typ?: string } | null> {
  try {
    const [header, mid, sig] = token.split(".");
    if (!header || !mid || !sig) return null;
    const data = `${header}.${mid}`;
    const expected = createHmac("sha256", secret()).update(data).digest();
    const actual = fromB64url(sig);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }
    const payload = JSON.parse(fromB64url(mid).toString("utf8")) as TokenPayload & {
      typ?: string;
    };
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    // Reject non-access JWTs (e.g. if a typed JWT were ever reused as Bearer)
    if (payload.typ != null && payload.typ !== "access") return null;
    return payload;
  } catch {
    return null;
  }
}
