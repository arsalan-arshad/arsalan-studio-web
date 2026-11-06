import {
  forbidden,
  getSessionUser,
  requireVerifiedEmail,
  unauthorized,
} from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { isR2ObjectKey, signedDownloadUrl } from "@/lib/r2";
import { NextResponse } from "next/server";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const schema = z
  .object({
    body: z.string().trim().max(10000).optional().default(""),
    /** R2 object key from POST /api/uploads (private). */
    attachmentKey: z
      .string()
      .trim()
      .max(500)
      .refine((v) => isR2ObjectKey(v), "Invalid attachment key")
      .optional(),
    attachmentName: z.string().trim().max(255).optional(),
    attachmentSize: z.number().int().positive().max(10_000_000).optional(),
  })
  .refine((d) => Boolean(d.body?.trim()) || Boolean(d.attachmentKey), {
    message: "Message body or attachment required",
  });

export async function POST(request: Request, ctx: Ctx) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  const unverified = requireVerifiedEmail(user);
  if (unverified) return unverified;
  const { id } = await ctx.params;

  const thread = await prisma.thread.findUnique({ where: { id } });
  if (!thread) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  if (user.role !== "ADMIN" && thread.clientId !== user.id) {
    return forbidden();
  }
  if (thread.status === "CLOSED" && user.role !== "ADMIN") {
    return NextResponse.json(
      { ok: false, error: "Thread is closed" },
      { status: 400 },
    );
  }

  try {
    const data = schema.parse(await request.json());
    if (data.attachmentKey && !data.attachmentKey.includes(`/${user.id}/`)) {
      // Keys are namespaced by uploader id from /api/uploads
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          { ok: false, error: "Invalid attachment" },
          { status: 400 },
        );
      }
    }

    const bodyText =
      data.body.trim() ||
      (data.attachmentName ? `Attached ${data.attachmentName}` : "Attachment");

    const message = await prisma.message.create({
      data: {
        threadId: id,
        senderId: user.id,
        body: bodyText,
        attachmentName: data.attachmentName,
        attachmentUrl: data.attachmentKey ?? null,
        attachmentSize: data.attachmentSize,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.thread.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        status:
          user.role === "ADMIN"
            ? thread.status === "CLOSED"
              ? "ACTIVE"
              : thread.status === "NEW"
                ? "ACTIVE"
                : thread.status
            : thread.status === "CLOSED"
              ? "ACTIVE"
              : thread.status,
      },
    });

    let attachmentUrl = message.attachmentUrl;
    if (attachmentUrl && isR2ObjectKey(attachmentUrl)) {
      try {
        attachmentUrl = await signedDownloadUrl(attachmentUrl);
      } catch {
        /* keep key if signing fails */
      }
    }

    return NextResponse.json({
      ok: true,
      message: { ...message, attachmentUrl },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[messages POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
