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

/** Admin: one-time chat reminder for the thread’s client. */
export async function POST(request: Request, ctx: Ctx) {
  const actor = await getSessionUser(request);
  if (!actor) return unauthorized();
  if (!isAdmin(actor.role)) {
    return forbidden("Only admin can send chat reminders");
  }

  const { id: threadId } = await ctx.params;
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      reminderEmailSentAt: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ ok: false, error: "Thread not found" }, { status: 404 });
  }
  if (thread.client.role !== "CLIENT" || !thread.client.active) {
    return NextResponse.json(
      { ok: false, error: "Cannot remind this client" },
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
      to: thread.client.email,
      name: thread.client.name,
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
    console.error("[threads reminder POST]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
