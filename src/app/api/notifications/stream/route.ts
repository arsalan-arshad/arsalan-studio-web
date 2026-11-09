import { getSessionUser, unauthorized } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { sleep, sseResponse } from "@/lib/sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_MS = 3_000;

async function snapshot(userId: string, limit: number) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({
      where: { userId, readAt: null },
    }),
  ]);
  const fingerprint = `${unreadCount}:${notifications.map((n) => `${n.id}:${n.readAt ?? ""}`).join("|")}`;
  return { notifications, unreadCount, fingerprint };
}

/** Live notification feed — polls DB and pushes when the user's inbox changes. */
export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 100)
    : 12;

  return sseResponse(request, async (send, signal) => {
    let last = "";
    while (!signal.aborted) {
      const snap = await snapshot(user.id, limit);
      if (snap.fingerprint !== last) {
        last = snap.fingerprint;
        send("notifications", {
          ok: true,
          notifications: snap.notifications,
          unreadCount: snap.unreadCount,
        });
      }
      try {
        await sleep(POLL_MS, signal);
      } catch {
        break;
      }
    }
  });
}
