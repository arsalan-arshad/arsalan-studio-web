import {
  forbidden,
  getSessionUser,
  requireChatAccess,
  requireVerifiedEmail,
  unauthorized,
} from "@/lib/auth-helpers";
import {
  CHAT_BODY_VERSION_PLAIN,
  isChatEncryptionConfigured,
  safeDecryptAttachmentName,
  safeDecryptBody,
  sealedAttachmentNameFields,
  sealedMessageFields,
} from "@/lib/chat-crypto";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { withSignedAttachments } from "@/lib/r2";
import { NextResponse } from "next/server";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

async function loadThreadForUser(id: string, userId: string, admin: boolean) {
  const thread = await prisma.thread.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });
  if (!thread) return null;
  if (!admin && thread.clientId !== userId) return "forbidden" as const;
  return thread;
}

async function lazyMigrateMessages(
  messages: {
    id: string;
    body: string;
    bodyNonce: string | null;
    bodyVersion: number;
    attachmentName: string | null;
    attachmentNameNonce: string | null;
    attachmentNameVersion: number;
  }[],
) {
  if (!isChatEncryptionConfigured()) return;
  for (const m of messages) {
    const needsBody = m.bodyVersion === CHAT_BODY_VERSION_PLAIN;
    const needsName =
      Boolean(m.attachmentName) && m.attachmentNameVersion === CHAT_BODY_VERSION_PLAIN;
    if (!needsBody && !needsName) continue;
    try {
      const data: Record<string, unknown> = {};
      if (needsBody) Object.assign(data, sealedMessageFields(m.body));
      if (needsName && m.attachmentName) {
        Object.assign(data, sealedAttachmentNameFields(m.attachmentName));
      }
      await prisma.message.update({ where: { id: m.id }, data });
    } catch (err) {
      console.error("[threads] lazy encrypt failed", m.id, err);
    }
  }
}

export async function GET(request: Request, ctx: Ctx) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!requireChatAccess(user)) {
    return forbidden("Support accounts cannot access client chat");
  }
  const unverified = requireVerifiedEmail(user);
  if (unverified) return unverified;
  const { id } = await ctx.params;
  const thread = await loadThreadForUser(id, user.id, isAdmin(user.role));
  if (thread === "forbidden") return forbidden();
  if (!thread) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  void lazyMigrateMessages(thread.messages);

  const decrypted = thread.messages.map((m) => ({
    ...m,
    body: safeDecryptBody(m),
    attachmentName: safeDecryptAttachmentName(m),
    bodyNonce: undefined,
    bodyVersion: undefined,
    attachmentNameNonce: undefined,
    attachmentNameVersion: undefined,
  }));
  const messages = await withSignedAttachments(decrypted);
  return NextResponse.json({
    ok: true,
    thread: { ...thread, messages },
  });
}

const patchSchema = z.object({
  status: z.enum(["NEW", "ACTIVE", "CLOSED"]),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden();
  const { id } = await ctx.params;

  try {
    const data = patchSchema.parse(await request.json());
    const thread = await prisma.thread.update({
      where: { id },
      data: { status: data.status },
    });
    return NextResponse.json({ ok: true, thread });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[threads PATCH]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
