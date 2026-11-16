import {
  forbidden,
  getSessionUser,
  unauthorized,
} from "@/lib/auth-helpers";
import {
  ADMIN_EMAIL_MAX_ATTACHMENT_BYTES,
  isAdminEmailFromAddress,
} from "@/lib/admin-email";
import {
  sendAdminEmail,
  type AdminEmailAttachment,
} from "@/lib/mail";
import { isAdmin } from "@/lib/roles";
import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 20;
const MAX_SUBJECT_LEN = 200;
const MAX_BODY_LEN = 100_000;
const MAX_FILES = 10;

function parseRecipients(raw: string): string[] | null {
  let list: unknown;
  try {
    list = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(list)) return null;
  const emails = list
    .map((v) => String(v ?? "").trim().toLowerCase())
    .filter(Boolean);
  if (!emails.length || emails.length > MAX_RECIPIENTS) return null;
  if (emails.some((e) => !EMAIL_RE.test(e))) return null;
  return [...new Set(emails)];
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  if (!isAdmin(user.role)) return forbidden("Admin only");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form data" },
      { status: 400 },
    );
  }

  const from = String(form.get("from") || "").trim().toLowerCase();
  const subject = String(form.get("subject") || "").trim();
  const body = String(form.get("body") || "").trim();
  const toRaw = String(form.get("to") || "");

  if (!isAdminEmailFromAddress(from)) {
    return NextResponse.json(
      { ok: false, error: "Invalid From address" },
      { status: 400 },
    );
  }

  const to = parseRecipients(toRaw);
  if (!to) {
    return NextResponse.json(
      {
        ok: false,
        error: `Provide 1–${MAX_RECIPIENTS} valid To addresses`,
      },
      { status: 400 },
    );
  }

  if (!subject || subject.length > MAX_SUBJECT_LEN) {
    return NextResponse.json(
      { ok: false, error: "Subject is required (max 200 characters)" },
      { status: 400 },
    );
  }

  if (!body || body.length > MAX_BODY_LEN) {
    return NextResponse.json(
      { ok: false, error: "Body is required" },
      { status: 400 },
    );
  }

  const fileEntries = form
    .getAll("attachments")
    .filter((v): v is File => typeof File !== "undefined" && v instanceof File)
    .filter((f) => f.size > 0 && f.name);

  if (fileEntries.length > MAX_FILES) {
    return NextResponse.json(
      { ok: false, error: `At most ${MAX_FILES} attachments` },
      { status: 400 },
    );
  }

  let totalBytes = 0;
  const attachments: AdminEmailAttachment[] = [];
  for (const file of fileEntries) {
    totalBytes += file.size;
    if (totalBytes > ADMIN_EMAIL_MAX_ATTACHMENT_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: `Attachments exceed ${Math.floor(ADMIN_EMAIL_MAX_ATTACHMENT_BYTES / (1024 * 1024))} MB total limit`,
        },
        { status: 400 },
      );
    }
    const buf = Buffer.from(await file.arrayBuffer());
    attachments.push({
      filename: file.name.slice(0, 200),
      content: buf,
      contentType: file.type || undefined,
    });
  }

  try {
    const result = await sendAdminEmail({
      from,
      to,
      subject,
      text: body,
      attachments: attachments.length ? attachments : undefined,
    });

    if (!result.sent) {
      if (result.reason === "no_api_key") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "RESEND_API_KEY is not configured — email was not sent",
          },
          { status: 503 },
        );
      }
      return NextResponse.json(
        {
          ok: false,
          error: result.message || "Failed to send email",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      toCount: to.length,
      attachmentCount: attachments.length,
    });
  } catch (err) {
    console.error("[admin/email POST]", err);
    return NextResponse.json(
      { ok: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}
