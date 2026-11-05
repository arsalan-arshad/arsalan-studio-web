import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  const threads =
    user.role === "ADMIN"
      ? await prisma.thread.findMany({
          orderBy: { updatedAt: "desc" },
          include: {
            client: { select: { id: true, name: true, email: true } },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { body: true, createdAt: true },
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
              select: { body: true, createdAt: true },
            },
            _count: { select: { messages: true } },
          },
        });

  return NextResponse.json({ ok: true, threads });
}

const createSchema = z.object({
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
});

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role === "ADMIN") {
    return forbidden("Admins reply in existing threads");
  }

  try {
    const data = createSchema.parse(await request.json());
    const thread = await prisma.thread.create({
      data: {
        subject: data.subject,
        status: "NEW",
        clientId: user.id,
        messages: {
          create: {
            senderId: user.id,
            body: data.body,
          },
        },
      },
      include: {
        messages: true,
      },
    });
    return NextResponse.json({ ok: true, thread });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
    console.error("[threads POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
