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

async function loadThreadForUser(id: string, userId: string, isAdmin: boolean) {
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
  if (!isAdmin && thread.clientId !== userId) return "forbidden" as const;
  return thread;
}

export async function GET(request: Request, ctx: Ctx) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  const unverified = requireVerifiedEmail(user);
  if (unverified) return unverified;
  const { id } = await ctx.params;
  const thread = await loadThreadForUser(id, user.id, user.role === "ADMIN");
  if (thread === "forbidden") return forbidden();
  if (!thread) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, thread });
}

const patchSchema = z.object({
  status: z.enum(["NEW", "ACTIVE", "CLOSED"]),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (user.role !== "ADMIN") return forbidden();
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
