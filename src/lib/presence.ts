import { isUserOnline } from "@/lib/format-presence";
import { prisma } from "@/lib/prisma";

/** Record a successful auth; also refreshes lastSeenAt. */
export async function touchLastLogin(userId: string): Promise<void> {
  const now = new Date();
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: now, lastSeenAt: now },
  });
}

/** Lightweight presence heartbeat while chat (or shell) is open. */
export async function touchLastSeen(userId: string): Promise<Date> {
  const now = new Date();
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: now },
  });
  return now;
}

/** Most recently seen active admin — “studio” presence for clients. */
export async function getStudioPresence(): Promise<{
  online: boolean;
  lastSeenAt: string | null;
  image: string | null;
  name: string | null;
}> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", active: true },
    orderBy: { lastSeenAt: "desc" },
    select: { lastSeenAt: true, image: true, name: true },
  });
  return {
    online: isUserOnline(admin?.lastSeenAt),
    lastSeenAt: admin?.lastSeenAt?.toISOString() ?? null,
    image: admin?.image ?? null,
    name: admin?.name ?? null,
  };
}
