import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Delete a user and related chat data.
 * Cascades tokens/accounts via Prisma; threads/messages cleaned explicitly
 * (Message.senderId and Thread.clientId are not onDelete: Cascade).
 */
export async function DELETE(request: Request, ctx: Ctx) {
  const admin = await getSessionUser(request);
  if (!admin) return unauthorized();
  if (admin.role !== "ADMIN") return forbidden();

  const { id } = await ctx.params;
  if (id === admin.id) {
    return NextResponse.json(
      { ok: false, error: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { ok: false, error: "Cannot delete the last admin" },
        { status: 400 },
      );
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const threads = await tx.thread.findMany({
        where: { clientId: id },
        select: { id: true },
      });
      const threadIds = threads.map((t) => t.id);

      if (threadIds.length) {
        await tx.inquiry.updateMany({
          where: { threadId: { in: threadIds } },
          data: { threadId: null, status: "ARCHIVED" },
        });
        await tx.message.deleteMany({ where: { threadId: { in: threadIds } } });
        await tx.thread.deleteMany({ where: { id: { in: threadIds } } });
      }

      // Admin replies (or any messages) in other clients' threads
      await tx.message.deleteMany({ where: { senderId: id } });

      await tx.inquiry.updateMany({
        where: { userId: id },
        data: { userId: null },
      });

      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/users DELETE]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
