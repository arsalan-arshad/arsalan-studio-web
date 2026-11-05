import { Resend } from "resend";

export async function notifyContactInquiry(input: {
  name: string;
  email: string;
  company?: string;
  message: string;
  needs: string[];
}) {
  const to = process.env.CONTACT_NOTIFY_TO || process.env.CONTACT_TO_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (!to) {
    console.info("[mail] CONTACT_NOTIFY_TO unset — skip email");
    return { sent: false as const, reason: "no_recipient" };
  }
  if (!key) {
    console.info("[mail] RESEND_API_KEY unset — inquiry saved, email skipped", {
      to,
      from: input.email,
    });
    return { sent: false as const, reason: "no_api_key" };
  }

  const resend = new Resend(key);
  const from = process.env.CONTACT_FROM_EMAIL || "Arsalan Studio <onboarding@resend.dev>";
  await resend.emails.send({
    from,
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
