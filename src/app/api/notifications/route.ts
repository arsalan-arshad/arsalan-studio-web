import { getSessionUser, unauthorized } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "30");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 100)
    : 30;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({
      where: { userId: user.id, readAt: null },
    }),
  ]);

  return NextResponse.json({ ok: true, notifications, unreadCount });
}
