import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
/** Tolerate small clock skew between app servers / email clients. */
const EXPIRY_SKEW_MS = 5 * 60 * 1000;
const BOOTSTRAP_TTL_MS = 10 * 60 * 1000;
/** Min gap between resend requests per user */
export const RESEND_COOLDOWN_MS = 60_000;

export function isEmailVerified(user: {
  emailVerified: Date | null;
  role: string;
}) {
  // Staff (ADMIN / SUB_ADMIN) are never blocked by verification gate
  if (user.role === "ADMIN" || user.role === "SUB_ADMIN") return true;
  return Boolean(user.emailVerified);
}

export async function createVerificationToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  // Invalidate prior unused tokens for this user
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const row = await prisma.emailVerificationToken.create({
    data: { token, userId, expires },
  });
  return row;
}

export async function issueAndSendVerification(user: {
  id: string;
  email: string;
  name: string;
}) {
  const row = await createVerificationToken(user.id);
  const result = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    token: row.token,
  });
  return { token: row.token, ...result };
}

/** Short-lived one-time web sign-in (verify / set-password flows). */
export async function issueBootstrapToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + BOOTSTRAP_TTL_MS);
  await prisma.authBootstrapToken.deleteMany({ where: { userId } });
  await prisma.authBootstrapToken.create({
    data: { token, userId, expires },
  });
  return token;
}

export async function consumeBootstrapToken(token: string) {
  const row = await prisma.authBootstrapToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!row) return null;
  if (row.expires.getTime() + EXPIRY_SKEW_MS < Date.now()) {
    await prisma.authBootstrapToken.delete({ where: { id: row.id } }).catch(() => undefined);
    return null;
  }
  await prisma.authBootstrapToken.deleteMany({ where: { userId: row.userId } });
  return row.user;
}

export async function verifyEmailToken(token: string) {
  const row = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!row) {
    return { ok: false as const, error: "Invalid or expired link" };
  }

  const expired = row.expires.getTime() + EXPIRY_SKEW_MS < Date.now();
  if (expired && !row.usedAt) {
    await prisma.emailVerificationToken.delete({ where: { id: row.id } }).catch(() => undefined);
    return { ok: false as const, error: "Link expired — request a new one" };
  }

  // Already consumed — idempotent success (Strict Mode / effect re-run / double click)
  if (row.usedAt) {
    if (!row.user.emailVerified) {
      return { ok: false as const, error: "Invalid or expired link" };
    }
    const bootstrapToken = await issueBootstrapToken(row.userId);
    return {
      ok: true as const,
      user: row.user,
      alreadyVerified: true as const,
      bootstrapToken,
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    }),
    // Drop other unused tokens for this user; keep this one for idempotent retries
    prisma.emailVerificationToken.deleteMany({
      where: { userId: row.userId, usedAt: null, NOT: { id: row.id } },
    }),
  ]);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: row.userId } });
  const bootstrapToken = await issueBootstrapToken(user.id);

  return {
    ok: true as const,
    user,
    alreadyVerified: false as const,
    bootstrapToken,
  };
}

export async function canResendVerification(userId: string) {
  const latest = await prisma.emailVerificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return { ok: true as const };
  const elapsed = Date.now() - latest.createdAt.getTime();
  if (elapsed < RESEND_COOLDOWN_MS) {
    const retryAfterSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
    return { ok: false as const, retryAfterSec };
  }
  return { ok: true as const };
}
