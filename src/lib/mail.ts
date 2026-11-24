import { Resend } from "resend";
import type { AdminEmailFromAddress } from "@/lib/admin-email";
import { brand } from "@/lib/brand";

export {
  ADMIN_EMAIL_FROM_ADDRESSES,
  ADMIN_EMAIL_MAX_ATTACHMENT_BYTES,
  isAdminEmailFromAddress,
  type AdminEmailFromAddress,
} from "@/lib/admin-email";

function emailFrom() {
  const raw =
    process.env.EMAIL_FROM ||
    process.env.CONTACT_FROM_EMAIL ||
    `noreply@${brand.domain}`;
  if (raw.includes("<")) return raw;
  return `Arsalan Studio <${raw}>`;
}

/** Admin-initiated chat outreach — always From hello@… */
function studioChatFrom() {
  return `Arsalan Studio <${brand.studioEmail}>`;
}

function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    `https://${brand.domain}`
  ).replace(/\/$/, "");
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
  agentCapabilities?: string;
  agentBlockers?: string;
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
      input.agentCapabilities
        ? `Agent capabilities / write access: ${input.agentCapabilities}`
        : null,
      input.agentBlockers
        ? `Production blockers: ${input.agentBlockers}`
        : null,
      "",
      input.message,
    ]
      .filter((line) => line !== null)
      .join("\n"),
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

export async function sendInviteSetPasswordEmail(input: {
  to: string;
  name: string;
  token: string;
}) {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    `https://${brand.domain}`;
  const setUrl = `${site.replace(/\/$/, "")}/set-password?token=${encodeURIComponent(input.token)}`;
  const resend = resendClient();

  if (!resend) {
    console.info("[mail] RESEND_API_KEY unset — invite email skipped (dev)", {
      to: input.to,
      setUrl,
    });
    return { sent: false as const, reason: "no_api_key" as const, setUrl };
  }

  await resend.emails.send({
    from: emailFrom(),
    to: input.to,
    subject: "You’re invited — set your password — Arsalan Studio",
    text: [
      `Hi ${input.name},`,
      "",
      "An admin invited you to Arsalan Studio. Set your password to sign in:",
      setUrl,
      "",
      "This link expires in 7 days. If you were not expecting this, ignore this email.",
      "",
      `— ${brand.name}`,
    ].join("\n"),
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>An admin invited you to Arsalan Studio. Set your password to sign in:</p>
      <p><a href="${setUrl}">Set password</a></p>
      <p style="color:#666;font-size:14px">Or paste this link:<br/>${setUrl}</p>
      <p style="color:#666;font-size:14px">This link expires in 7 days.</p>
      <p>— ${escapeHtml(brand.name)}</p>
    `,
  });
  return { sent: true as const, setUrl };
}

/**
 * Email the client when an admin opens a brand-new conversation
 * (user had no prior thread). Not sent on later admin replies.
 */
export async function sendAdminStartedChatEmail(input: {
  to: string;
  name: string;
  threadId: string;
  preview?: string;
}) {
  const chatUrl = `${siteBaseUrl()}/chat?thread=${encodeURIComponent(input.threadId)}`;
  const resend = resendClient();

  if (!resend) {
    console.info("[mail] RESEND_API_KEY unset — admin chat email skipped (dev)", {
      to: input.to,
      chatUrl,
    });
    return { sent: false as const, reason: "no_api_key" as const, chatUrl };
  }

  const preview = input.preview?.trim();
  await resend.emails.send({
    from: studioChatFrom(),
    to: input.to,
    subject: `${brand.shortName} wants to chat — Arsalan Studio`,
    text: [
      `Hi ${input.name},`,
      "",
      `${brand.name} started a conversation with you on the studio site.`,
      preview ? `Message: ${preview}` : null,
      "",
      "Open Messages to reply:",
      chatUrl,
      "",
      `— ${brand.name}`,
      brand.studioEmail,
    ]
      .filter((line) => line !== null)
      .join("\n"),
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>${escapeHtml(brand.name)} started a conversation with you on the studio site.</p>
      ${
        preview
          ? `<p style="color:#333">${escapeHtml(preview)}</p>`
          : ""
      }
      <p><a href="${chatUrl}">Open Messages</a></p>
      <p style="color:#666;font-size:14px">Or paste this link:<br/>${chatUrl}</p>
      <p>— ${escapeHtml(brand.name)}<br/>${escapeHtml(brand.studioEmail)}</p>
    `,
  });
  return { sent: true as const, chatUrl };
}

/**
 * One-time reminder when admin has replied in chat but the client
 * has not returned — deep-links into the existing thread.
 */
export async function sendChatReminderEmail(input: {
  to: string;
  name: string;
  threadId: string;
}) {
  const chatUrl = `${siteBaseUrl()}/chat?thread=${encodeURIComponent(input.threadId)}`;
  const resend = resendClient();

  if (!resend) {
    console.info("[mail] RESEND_API_KEY unset — chat reminder email skipped (dev)", {
      to: input.to,
      chatUrl,
    });
    return { sent: false as const, reason: "no_api_key" as const, chatUrl };
  }

  await resend.emails.send({
    from: studioChatFrom(),
    to: input.to,
    subject: `I checked your chat query — please join — ${brand.shortName}`,
    text: [
      `Hi ${input.name},`,
      "",
      `I checked your chat query on ${brand.name}'s studio site and left a reply for you.`,
      "Please join the conversation when you have a moment so we can continue.",
      "",
      "Open Messages:",
      chatUrl,
      "",
      `— ${brand.name}`,
      brand.studioEmail,
    ].join("\n"),
    html: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>I checked your chat query on ${escapeHtml(brand.name)}'s studio site and left a reply for you.</p>
      <p>Please join the conversation when you have a moment so we can continue.</p>
      <p><a href="${chatUrl}">Open Messages</a></p>
      <p style="color:#666;font-size:14px">Or paste this link:<br/>${chatUrl}</p>
      <p>— ${escapeHtml(brand.name)}<br/>${escapeHtml(brand.studioEmail)}</p>
    `,
  });
  return { sent: true as const, chatUrl };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type AdminEmailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

/**
 * Generic admin-composed email via Resend.
 * `from` must be one of the addresses in `@/lib/admin-email`.
 */
export async function sendAdminEmail(input: {
  from: AdminEmailFromAddress;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: AdminEmailAttachment[];
}) {
  const resend = resendClient();
  if (!resend) {
    console.info("[mail] RESEND_API_KEY unset — admin email skipped (dev)", {
      from: input.from,
      toCount: input.to.length,
      subject: input.subject,
      attachmentCount: input.attachments?.length ?? 0,
    });
    return { sent: false as const, reason: "no_api_key" as const };
  }

  const from = `Arsalan Studio <${input.from}>`;
  const html =
    input.html ??
    `<pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(input.text)}</pre>`;

  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  });

  if (error) {
    console.error("[mail] admin email failed", {
      from: input.from,
      toCount: input.to.length,
      message: error.message,
      name: error.name,
    });
    return {
      sent: false as const,
      reason: "send_failed" as const,
      message: error.message,
    };
  }

  return { sent: true as const, id: data?.id };
}
