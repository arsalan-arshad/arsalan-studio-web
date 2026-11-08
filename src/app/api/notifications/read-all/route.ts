import { getSessionUser, unauthorized } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const result = await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true, updated: result.count });
}
