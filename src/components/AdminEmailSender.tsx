"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ADMIN_EMAIL_FROM_ADDRESSES,
  ADMIN_EMAIL_MAX_ATTACHMENT_BYTES,
} from "@/lib/admin-email";
import { brand } from "@/lib/brand";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MB = Math.floor(ADMIN_EMAIL_MAX_ATTACHMENT_BYTES / (1024 * 1024));

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminEmailSender() {
  const [from, setFrom] = useState<string>(brand.studioEmail);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [draftTo, setDraftTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalAttachmentBytes = useMemo(
    () => files.reduce((sum, f) => sum + f.size, 0),
    [files],
  );

  function addRecipient(raw: string) {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setError(`Invalid email: ${raw.trim()}`);
      return;
    }
    setError("");
    setRecipients((prev) =>
      prev.includes(email) ? prev : [...prev, email],
    );
    setDraftTo("");
  }

  function onToKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (draftTo.trim()) {
        e.preventDefault();
        addRecipient(draftTo);
      }
    } else if (e.key === "Backspace" && !draftTo && recipients.length) {
      setRecipients((prev) => prev.slice(0, -1));
    }
  }

  function onFilesPicked(list: FileList | null) {
    if (!list?.length) return;
    setError("");
    const next = [...files];
    for (const file of Array.from(list)) {
      const wouldBe =
        next.reduce((s, f) => s + f.size, 0) + file.size;
      if (wouldBe > ADMIN_EMAIL_MAX_ATTACHMENT_BYTES) {
        setError(
          `Attachments would exceed the ${MAX_MB} MB total limit (Resend: 40 MB after Base64).`,
        );
        break;
      }
      if (next.length >= 10) {
        setError("At most 10 attachments.");
        break;
      }
      next.push(file);
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const to = [...recipients];
    if (draftTo.trim()) {
      const email = draftTo.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        setError(`Invalid email: ${draftTo.trim()}`);
        setBusy(false);
        return;
      }
      if (!to.includes(email)) to.push(email);
    }

    if (!to.length) {
      setError("Add at least one recipient.");
      setBusy(false);
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required.");
      setBusy(false);
      return;
    }
    if (!body.trim()) {
      setError("Body is required.");
      setBusy(false);
      return;
    }

    const form = new FormData();
    form.set("from", from);
    form.set("to", JSON.stringify(to));
    form.set("subject", subject.trim());
    form.set("body", body);
    for (const file of files) {
      form.append("attachments", file, file.name);
    }

    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send email");
        return;
      }
      setNotice(
        `Sent to ${data.toCount} recipient${data.toCount === 1 ? "" : "s"}${
          data.attachmentCount
            ? ` with ${data.attachmentCount} attachment${data.attachmentCount === 1 ? "" : "s"}`
            : ""
        }.`,
      );
      setRecipients([]);
      setDraftTo("");
      setSubject("");
      setBody("");
      setFiles([]);
    } catch {
      setError("Could not send email");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin only</p>
          <h1 className="section-title mt-2">Send email</h1>
          <p className="mt-2 text-sm text-muted">
            Compose via Resend from a studio address.{" "}
            <Link href="/admin" className="text-accent hover:underline">
              ← Studio desk
            </Link>
            {" · "}
            <Link href="/admin/users" className="text-accent hover:underline">
              Users
            </Link>
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 border border-line bg-bg-elevated p-4"
      >
        <div>
          <label htmlFor="email-from" className="mb-1 block text-xs text-muted">
            From
          </label>
          <select
            id="email-from"
            className="input-field"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {ADMIN_EMAIL_FROM_ADDRESSES.map((addr) => (
              <option key={addr} value={addr}>
                {addr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="email-to" className="mb-1 block text-xs text-muted">
            To
          </label>
          <div className="flex flex-wrap items-center gap-1.5 border border-line bg-bg px-2 py-1.5 focus-within:border-accent">
            {recipients.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 border border-line bg-bg-elevated px-1.5 py-0.5 text-xs text-ink"
              >
                {email}
                <button
                  type="button"
                  className="text-muted hover:text-danger"
                  aria-label={`Remove ${email}`}
                  onClick={() =>
                    setRecipients((prev) => prev.filter((e) => e !== email))
                  }
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="email-to"
              type="email"
              className="min-w-[12rem] flex-1 bg-transparent py-1 text-sm text-ink outline-none"
              placeholder={
                recipients.length
                  ? "Add another…"
                  : "recipient@example.com"
              }
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              onKeyDown={onToKeyDown}
              onBlur={() => {
                if (draftTo.trim()) addRecipient(draftTo);
              }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            Press Enter or comma to add. Multiple recipients allowed.
          </p>
        </div>

        <div>
          <label
            htmlFor="email-subject"
            className="mb-1 block text-xs text-muted"
          >
            Subject
          </label>
          <input
            id="email-subject"
            className="input-field"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div>
          <label htmlFor="email-body" className="mb-1 block text-xs text-muted">
            Body
          </label>
          <textarea
            id="email-body"
            className="input-field min-h-[12rem] font-mono text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-muted">Plain text (sent as text + simple HTML).</p>
        </div>

        <div>
          <label
            htmlFor="email-attachments"
            className="mb-1 block text-xs text-muted"
          >
            Attachments{" "}
            <span className="font-normal">(optional, max {MAX_MB} MB total)</span>
          </label>
          <input
            ref={fileInputRef}
            id="email-attachments"
            type="file"
            multiple
            className="block w-full text-sm text-muted file:mr-3 file:border file:border-line file:bg-bg file:px-2 file:py-1 file:text-xs file:text-ink"
            onChange={(e) => onFilesPicked(e.target.files)}
          />
          {files.length ? (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-2 text-xs text-ink"
                >
                  <span className="truncate">
                    {f.name}{" "}
                    <span className="text-muted">({formatBytes(f.size)})</span>
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-muted hover:text-danger"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
              <li className="text-muted">
                Total {formatBytes(totalAttachmentBytes)} / {MAX_MB} MB
              </li>
            </ul>
          ) : (
            <p className="mt-1 text-xs text-muted">
              Resend free tier allows attachments (email ≤ 40 MB after Base64).
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Sending…" : "Send email"}
        </button>
      </form>

      {notice ? (
        <p className="mt-4 rounded-sm border border-accent/40 bg-accent-wash px-3 py-2 text-sm text-ink">
          {notice}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
