import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
/** Min gap between resend requests per user */
export const RESEND_COOLDOWN_MS = 60_000;

export function isEmailVerified(user: {
  emailVerified: Date | null;
  role: string;
}) {
  // Admins are never blocked by verification gate
  if (user.role === "ADMIN") return true;
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

export async function verifyEmailToken(token: string) {
  const row = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!row) return { ok: false as const, error: "Invalid or expired link" };
  if (row.expires.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({ where: { id: row.id } });
    return { ok: false as const, error: "Link expired — request a new one" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return { ok: true as const, user: row.user };
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
