import { Resend } from "resend";
import { brand } from "@/lib/brand";

function emailFrom() {
  const raw =
    process.env.EMAIL_FROM ||
    process.env.CONTACT_FROM_EMAIL ||
    `noreply@${brand.domain}`;
  if (raw.includes("<")) return raw;
  return `Arsalan Studio <${raw}>`;
}

function resendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function notifyContactInquiry(input: {
  name: string;
  email: string;
  company?: string;
  message: string;
  needs: string[];
}) {
  const to = process.env.CONTACT_NOTIFY_TO || process.env.CONTACT_TO_EMAIL;
  const resend = resendClient();
  if (!to) {
    console.info("[mail] CONTACT_NOTIFY_TO unset — skip email");
    return { sent: false as const, reason: "no_recipient" };
  }
  if (!resend) {
    console.info("[mail] RESEND_API_KEY unset — inquiry saved, email skipped", {
      to,
      from: input.email,
    });
    return { sent: false as const, reason: "no_api_key" };
  }

  await resend.emails.send({
    from: emailFrom(),
    to,
    replyTo: input.email,
    subject: `New inquiry from ${input.name}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Company: ${input.company || "—"}`,
      `Needs: ${input.needs.join(", ") || "—"}`,
      "",
      input.message,
    ].join("\n"),
  });
  return { sent: true as const };
}

export async function sendVerificationEmail(input: {
  to: string;
  name: string;
  token: string;
}) {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    `https://${brand.domain}`;
  const verifyUrl = `${site.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(input.token)}`;
  const resend = resendClient();

  if (!resend) {
    console.info("[mail] RESEND_API_KEY unset — verification email skipped (dev)", {
      to: input.to,
      verifyUrl,
    });
    return { sent: false as const, reason: "no_api_key" as const, verifyUrl };
  }

  await resend.emails.send({
    from: emailFrom(),
    to: input.to,
    subject: "Verify your email — Arsalan Studio",
    text: [
      `Hi ${input.name},`,
      "",
      "Thanks for signing up. Confirm your email to unlock Messages:",
      verifyUrl,
      "",
      "This link expires in 24 hours. If you did not create an account, ignore this email.",
      "",
      `— ${brand.name}`,
    ].join("\n"),
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Thanks for signing up. Confirm your email to unlock Messages:</p>
      <p><a href="${verifyUrl}">Verify email</a></p>
      <p style="color:#666;font-size:14px">Or paste this link:<br/>${verifyUrl}</p>
      <p style="color:#666;font-size:14px">This link expires in 24 hours.</p>
      <p>— ${escapeHtml(brand.name)}</p>
    `,
  });
  return { sent: true as const, verifyUrl };
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  token: string;
}) {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    `https://${brand.domain}`;
  const resetUrl = `${site.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(input.token)}`;
  const resend = resendClient();

  if (!resend) {
    console.info("[mail] RESEND_API_KEY unset — password reset email skipped (dev)", {
      to: input.to,
      resetUrl,
    });
    return { sent: false as const, reason: "no_api_key" as const, resetUrl };
  }

  await resend.emails.send({
    from: emailFrom(),
    to: input.to,
    subject: "Reset your password — Arsalan Studio",
    text: [
      `Hi ${input.name},`,
      "",
      "We received a request to reset your password. Use this link:",
      resetUrl,
      "",
      "This link expires in 1 hour. If you did not request a reset, ignore this email.",
      "",
      `— ${brand.name}`,
    ].join("\n"),
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>We received a request to reset your password:</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p style="color:#666;font-size:14px">Or paste this link:<br/>${resetUrl}</p>
      <p style="color:#666;font-size:14px">This link expires in 1 hour.</p>
      <p>— ${escapeHtml(brand.name)}</p>
    `,
  });
  return { sent: true as const, resetUrl };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
