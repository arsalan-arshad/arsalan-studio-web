import {
  forbidden,
  getSessionUser,
  requireChatAccess,
  requireVerifiedEmail,
  unauthorized,
} from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { sleep, sseResponse } from "@/lib/sse";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const POLL_MS = 2_500;

/**
 * Chat thread live updates. Emits `refresh` when message count / thread stamp changes;
 * clients re-fetch the normal GET for decrypted payloads.
 */
export async function GET(request: Request, ctx: Ctx) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!requireChatAccess(user)) {
    return forbidden("Support accounts cannot access client chat");
  }
  const unverified = requireVerifiedEmail(user);
  if (unverified) return unverified;

  const { id } = await ctx.params;
  const thread = await prisma.thread.findUnique({
    where: { id },
    select: { id: true, clientId: true },
  });
  if (!thread) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (!isAdmin(user.role) && thread.clientId !== user.id) {
    return forbidden();
  }

  return sseResponse(request, async (send, signal) => {
    let last = "";
    while (!signal.aborted) {
      const [meta, count] = await Promise.all([
        prisma.thread.findUnique({
          where: { id },
          select: { updatedAt: true, status: true },
        }),
        prisma.message.count({ where: { threadId: id } }),
      ]);
      if (!meta) break;
      const fingerprint = `${count}:${meta.updatedAt.toISOString()}:${meta.status}`;
      if (fingerprint !== last) {
        last = fingerprint;
        send("refresh", { ok: true, messageCount: count, status: meta.status });
      }
      try {
        await sleep(POLL_MS, signal);
      } catch {
        break;
      }
    }
  });
}
