import {
  forbidden,
  getSessionUser,
  requireVerifiedEmail,
  unauthorized,
} from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  body: z.string().trim().min(1).max(10000),
  attachmentName: z.string().trim().max(255).optional(),
  attachmentUrl: z.string().trim().max(500).optional(),
  attachmentSize: z.number().int().positive().max(10_000_000).optional(),
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
    const message = await prisma.message.create({
      data: {
        threadId: id,
        senderId: user.id,
        body: data.body,
        attachmentName: data.attachmentName,
        attachmentUrl: data.attachmentUrl,
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

    return NextResponse.json({ ok: true, message });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[messages POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
