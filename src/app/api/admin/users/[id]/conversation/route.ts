import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import { sealedMessageFields } from "@/lib/chat-crypto";
import { sendAdminStartedChatEmail } from "@/lib/mail";
import { notifyChatMessage } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { NextResponse } from "next/server";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  subject: z.string().trim().min(1).max(200).optional(),
  body: z.string().trim().min(1).max(10000).optional(),
});

/**
 * Admin: open an existing client thread, or create one (with first message),
 * notify in-app, and email only when the conversation is brand-new.
 */
export async function POST(request: Request, ctx: Ctx) {
  const actor = await getSessionUser(request);
  if (!actor) return unauthorized();
  if (!isAdmin(actor.role)) {
    return forbidden("Only admin can start client conversations");
  }

  const { id: clientId } = await ctx.params;
  if (clientId === actor.id) {
    return NextResponse.json(
      { ok: false, error: "Cannot start a conversation with yourself" },
      { status: 400 },
    );
  }

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
  });

  if (!client) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }
  if (client.role !== "CLIENT") {
    return NextResponse.json(
      { ok: false, error: "Conversations are only for client accounts" },
      { status: 400 },
    );
  }
  if (!client.active) {
    return NextResponse.json(
      { ok: false, error: "User is inactive" },
      { status: 400 },
    );
  }

  const existing = await prisma.thread.findFirst({
    where: { clientId: client.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({
      ok: true,
      created: false,
      threadId: existing.id,
      emailSent: false,
    });
  }

  let subject = "Message from the studio";
  let bodyText = `Hi ${client.name} — I'd like to start a conversation with you. Reply here when you're ready.`;

  try {
    const json = await request.json().catch(() => ({}));
    const data = schema.parse(json ?? {});
    if (data.subject) subject = data.subject;
    if (data.body) bodyText = data.body;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
  }

  try {
    const sealed = sealedMessageFields(bodyText);
    const thread = await prisma.thread.create({
      data: {
        subject,
        status: "ACTIVE",
        clientId: client.id,
        messages: {
          create: {
            senderId: actor.id,
            body: sealed.body,
            bodyNonce: sealed.bodyNonce,
            bodyVersion: sealed.bodyVersion,
          },
        },
      },
      select: { id: true },
    });

    await notifyChatMessage({
      threadId: thread.id,
      clientId: client.id,
      senderId: actor.id,
      senderName: actor.name,
      senderRole: actor.role,
      bodyPreview: bodyText,
    });

    let emailSent = false;
    try {
      const mail = await sendAdminStartedChatEmail({
        to: client.email,
        name: client.name,
        threadId: thread.id,
        preview: bodyText,
      });
      emailSent = mail.sent;
    } catch (err) {
      console.error("[admin conversation] email failed", err);
    }

    return NextResponse.json({
      ok: true,
      created: true,
      threadId: thread.id,
      emailSent,
    });
  } catch (err) {
    console.error("[admin conversation POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
