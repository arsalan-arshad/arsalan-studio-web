import { prisma } from "@/lib/prisma";

/** Cloudflare / Vercel / CloudFront placeholders — not real locations. */
const SKIP_COUNTRY = new Set(["", "XX", "T1", "A1", "A2", "O1"]);

function firstHeader(headers: Headers, names: string[]): string | null {
  for (const name of names) {
    const raw = headers.get(name)?.trim();
    if (raw) return raw;
  }
  return null;
}

function normalizeCountry(raw: string | null): string | null {
  if (!raw) return null;
  const code = raw.toUpperCase();
  if (SKIP_COUNTRY.has(code) || code.length > 8) return null;
  return code;
}

function normalizeCity(raw: string | null): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw.replace(/\+/g, " ")).trim();
    if (!decoded || decoded.length > 80) return null;
    return decoded;
  } catch {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.length > 80) return null;
    return trimmed;
  }
}

/**
 * Read best-effort country / city from common CDN / platform request headers.
 * No external geo IP lookup — blank when the edge does not provide values.
 */
export function locationFromHeaders(headers: Headers): {
  country: string | null;
  city: string | null;
} {
  const country = normalizeCountry(
    firstHeader(headers, [
      "cf-ipcountry",
      "x-vercel-ip-country",
      "cloudfront-viewer-country",
      "x-country-code",
    ]),
  );
  const city = normalizeCity(
    firstHeader(headers, [
      "cf-ipcity",
      "x-vercel-ip-city",
      "cloudfront-viewer-city",
      "x-city",
    ]),
  );
  return { country, city };
}

/**
 * Fill blank User.country / User.city from request headers.
 * Never overwrites an already-saved value. Fire-and-forget safe.
 */
export async function enrichUserLocationIfEmpty(
  userId: string,
  source: Request | Headers,
): Promise<void> {
  const headers = source instanceof Request ? source.headers : source;
  const { country, city } = locationFromHeaders(headers);
  if (!country && !city) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { country: true, city: true },
  });
  if (!user) return;

  const data: { country?: string; city?: string } = {};
  if (!user.country && country) data.country = country;
  if (!user.city && city) data.city = city;
  if (!Object.keys(data).length) return;

  await prisma.user.update({ where: { id: userId }, data });
}
