import {
  forbidden,
  getSessionUser,
  requireChatAccess,
  requireVerifiedEmail,
  unauthorized,
} from "@/lib/auth-helpers";
import { safeDecryptBody, sealedMessageFields } from "@/lib/chat-crypto";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!requireChatAccess(user)) {
    return forbidden("Support accounts cannot access client chat");
  }
  const unverified = requireVerifiedEmail(user);
  if (unverified) return unverified;

  const threads = isAdmin(user.role)
    ? await prisma.thread.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          client: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              body: true,
              bodyNonce: true,
              bodyVersion: true,
              createdAt: true,
            },
          },
          _count: { select: { messages: true } },
        },
      })
    : await prisma.thread.findMany({
        where: { clientId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
          client: { select: { id: true, name: true, email: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              body: true,
              bodyNonce: true,
              bodyVersion: true,
              createdAt: true,
            },
          },
          _count: { select: { messages: true } },
        },
      });

  const decrypted = threads.map((t) => ({
    ...t,
    messages: t.messages.map((m) => ({
      body: safeDecryptBody(m),
      createdAt: m.createdAt,
    })),
  }));

  return NextResponse.json({ ok: true, threads: decrypted });
}

const createSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
});

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!requireChatAccess(user)) {
    return forbidden("Support accounts cannot access client chat");
  }
  const unverified = requireVerifiedEmail(user);
  if (unverified) return unverified;
  if (isAdmin(user.role)) {
    return forbidden("Admins reply in existing threads");
  }

  try {
    const data = createSchema.parse(await request.json());
    const sealed = sealedMessageFields(data.body);
    const thread = await prisma.thread.create({
      data: {
        subject: data.subject,
        status: "NEW",
        clientId: user.id,
        messages: {
          create: {
            senderId: user.id,
            body: sealed.body,
            bodyNonce: sealed.bodyNonce,
            bodyVersion: sealed.bodyVersion,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    const messages = thread.messages.map((m) => ({
      ...m,
      body: safeDecryptBody(m),
      bodyNonce: undefined,
      bodyVersion: undefined,
    }));

    return NextResponse.json({
      ok: true,
      thread: { ...thread, messages },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[threads POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
