import { notifyContactInquiry } from "@/lib/mail";
import { notifyContactInquiryStaff } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const message = String(body.message ?? "").trim();
    const company = String(body.company ?? "").trim() || null;
    const timeline = String(body.timeline ?? "").trim() || null;
    const budget = String(body.budget ?? "").trim() || null;
    const otherNeed = String(body.otherNeed ?? "").trim() || null;
    const needs = Array.isArray(body.needs)
      ? body.needs.map((n: unknown) => String(n))
      : [];
    const offer = String(body.offer ?? "").trim();
    if (offer && !needs.includes(offer)) needs.push(offer);

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        company,
        needs,
        otherNeed,
        timeline,
        budget,
        message,
        userId: existingUser?.id,
      },
    });

    // If the email belongs to a verified registered client, open a follow-up thread.
    let threadId: string | null = null;
    if (
      existingUser &&
      existingUser.role === "CLIENT" &&
      existingUser.emailVerified
    ) {
      const thread = await prisma.thread.create({
        data: {
          subject: `Inquiry from ${name}`,
          status: "NEW",
          clientId: existingUser.id,
          messages: {
            create: {
              senderId: existingUser.id,
              body: [
                message,
                "",
                `Needs: ${needs.join(", ") || "—"}`,
                company ? `Company: ${company}` : null,
                timeline ? `Timeline: ${timeline}` : null,
                budget ? `Budget: ${budget}` : null,
              ]
                .filter(Boolean)
                .join("\n"),
            },
          },
        },
      });
      await prisma.inquiry.update({
        where: { id: inquiry.id },
        data: { threadId: thread.id, status: "LINKED" },
      });
      threadId = thread.id;
    }

    try {
      await notifyContactInquiry({ name, email, company: company ?? undefined, message, needs });
    } catch (err) {
      console.error("[contact] email failed", err);
    }

    try {
      await notifyContactInquiryStaff({
        inquiryId: inquiry.id,
        name,
        message,
      });
    } catch (err) {
      console.error("[contact] staff notification failed", err);
    }

    return NextResponse.json({ ok: true, inquiryId: inquiry.id, threadId });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
