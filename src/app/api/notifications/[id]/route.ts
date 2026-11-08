import { getSessionUser, unauthorized } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const existing = await prisma.notification.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const notification = existing.readAt
    ? existing
    : await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });

  return NextResponse.json({ ok: true, notification });
}
