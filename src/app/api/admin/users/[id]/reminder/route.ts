import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import { sendChatReminderEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Admin: one-time reminder email asking the client to rejoin an existing
 * chat thread. Sets Thread.reminderEmailSentAt so the button stays disabled.
 */
export async function POST(request: Request, ctx: Ctx) {
  const actor = await getSessionUser(request);
  if (!actor) return unauthorized();
  if (!isAdmin(actor.role)) {
    return forbidden("Only admin can send chat reminders");
  }

  const { id: clientId } = await ctx.params;
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
      { ok: false, error: "Reminders are only for client accounts" },
      { status: 400 },
    );
  }
  if (!client.active) {
    return NextResponse.json(
      { ok: false, error: "User is inactive" },
      { status: 400 },
    );
  }

  const thread = await prisma.thread.findFirst({
    where: { clientId: client.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, reminderEmailSentAt: true },
  });

  if (!thread) {
    return NextResponse.json(
      { ok: false, error: "No conversation with this user yet" },
      { status: 400 },
    );
  }

  if (thread.reminderEmailSentAt) {
    return NextResponse.json({
      ok: true,
      alreadySent: true,
      threadId: thread.id,
      reminderEmailSentAt: thread.reminderEmailSentAt,
      emailSent: false,
    });
  }

  try {
    const mail = await sendChatReminderEmail({
      to: client.email,
      name: client.name,
      threadId: thread.id,
    });

    if (!mail.sent) {
      return NextResponse.json({
        ok: true,
        alreadySent: false,
        threadId: thread.id,
        emailSent: false,
        reason: "reason" in mail ? mail.reason : "email_failed",
      });
    }

    const updated = await prisma.thread.update({
      where: { id: thread.id },
      data: { reminderEmailSentAt: new Date() },
      select: { id: true, reminderEmailSentAt: true },
    });

    return NextResponse.json({
      ok: true,
      alreadySent: false,
      threadId: updated.id,
      reminderEmailSentAt: updated.reminderEmailSentAt,
      emailSent: true,
    });
  } catch (err) {
    console.error("[admin reminder POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
