import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const EXPIRY_SKEW_MS = 5 * 60 * 1000;
/** Min gap between reset emails per user */
export const RESET_COOLDOWN_MS = 60_000;

export async function createPasswordResetToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  return prisma.passwordResetToken.create({
    data: { token, userId, expires },
  });
}

export async function issueAndSendPasswordReset(user: {
  id: string;
  email: string;
  name: string;
}) {
  const row = await createPasswordResetToken(user.id);
  const result = await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    token: row.token,
  });
  return { token: row.token, ...result };
}

export async function canRequestPasswordReset(userId: string) {
  const latest = await prisma.passwordResetToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) return { ok: true as const };
  const elapsed = Date.now() - latest.createdAt.getTime();
  if (elapsed < RESET_COOLDOWN_MS) {
    const retryAfterSec = Math.ceil((RESET_COOLDOWN_MS - elapsed) / 1000);
    return { ok: false as const, retryAfterSec };
  }
  return { ok: true as const };
}

export async function consumePasswordResetToken(token: string) {
  const row = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!row) return { ok: false as const, error: "Invalid or expired link" };
  if (row.expires.getTime() + EXPIRY_SKEW_MS < Date.now()) {
    await prisma.passwordResetToken.delete({ where: { id: row.id } }).catch(() => undefined);
    return { ok: false as const, error: "Link expired — request a new one" };
  }
  return { ok: true as const, row };
}

export async function completePasswordReset(token: string, passwordHash: string) {
  const result = await consumePasswordResetToken(token);
  if (!result.ok) return result;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: result.row.userId },
      data: {
        passwordHash,
        // Resetting via email proves ownership
        emailVerified: result.row.user.emailVerified ?? new Date(),
      },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: result.row.userId } }),
  ]);

  return { ok: true as const, user: result.row.user };
}
