import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ACCESS_TOKEN_TTL_SECONDS, signMobileToken } from "@/lib/mobile-token";
import type { Role, User } from "@prisma/client";

/** Refresh token lifetime — 30 days. */
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type TokenBundle = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type RefreshMeta = {
  userAgent?: string | null;
  ip?: string | null;
};

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

function newOpaqueToken() {
  return randomBytes(32).toString("hex");
}

export function clientMetaFromRequest(request: Request): RefreshMeta {
  return {
    userAgent: request.headers.get("user-agent"),
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip"),
  };
}

async function persistRefreshToken(userId: string, meta?: RefreshMeta) {
  const raw = newOpaqueToken();
  const tokenHash = hashToken(raw);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      userAgent: meta?.userAgent ?? null,
      ip: meta?.ip ?? null,
    },
  });
  return raw;
}

export function accessTokenForUser(user: {
  id: string;
  email: string;
  role: Role;
}) {
  return signMobileToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
}

/** Issue a new access + refresh pair (login / register). */
export async function issueTokenBundle(
  user: Pick<User, "id" | "email" | "role">,
  meta?: RefreshMeta,
): Promise<TokenBundle> {
  const accessToken = accessTokenForUser(user);
  const refreshToken = await persistRefreshToken(user.id, meta);
  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  };
}

/**
 * Rotate refresh token: validate, revoke old, issue new access + refresh.
 * Access JWTs used as `refreshToken` never match a DB hash → rejected.
 */
export async function rotateRefreshToken(
  rawRefresh: string,
  meta?: RefreshMeta,
): Promise<{ user: User; bundle: TokenBundle } | null> {
  if (!rawRefresh || rawRefresh.includes(".")) {
    // Access JWTs are dotted; opaque refresh tokens are hex — reject JWT-shaped input early
    return null;
  }

  const tokenHash = hashToken(rawRefresh);
  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;

  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });

  const bundle = await issueTokenBundle(row.user, meta);
  return { user: row.user, bundle };
}

/** Revoke one refresh token (logout). Returns false if unknown / already revoked. */
export async function revokeRefreshToken(rawRefresh: string): Promise<boolean> {
  if (!rawRefresh || rawRefresh.includes(".")) return false;
  const tokenHash = hashToken(rawRefresh);
  const row = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!row || row.revokedAt) return false;
  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revokedAt: new Date() },
  });
  return true;
}

/** Revoke all refresh tokens for a user (logout-all / security). */
export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
