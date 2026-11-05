import { createHmac, timingSafeEqual } from "crypto";

type TokenPayload = {
  sub: string;
  email: string;
  role: string;
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

export function signMobileToken(payload: Omit<TokenPayload, "exp">, days = 30) {
  const body: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + days * 24 * 60 * 60,
  };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const mid = b64url(JSON.stringify(body));
  const data = `${header}.${mid}`;
  const sig = createHmac("sha256", secret()).update(data).digest();
  return `${data}.${b64url(sig)}`;
}

export async function verifyMobileToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const [header, mid, sig] = token.split(".");
    if (!header || !mid || !sig) return null;
    const data = `${header}.${mid}`;
    const expected = createHmac("sha256", secret()).update(data).digest();
    const actual = fromB64url(sig);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }
    const payload = JSON.parse(fromB64url(mid).toString("utf8")) as TokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
