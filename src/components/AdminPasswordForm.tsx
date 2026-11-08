"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { PASSWORD_RULES_HINT } from "@/lib/password";

export function AdminPasswordForm() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") || "");
    const newPassword = String(form.get("newPassword") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update password");
        return;
      }
      (e.target as HTMLFormElement).reset();
      setNotice("Password updated.");
    } catch {
      setError("Could not update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="eyebrow">Account</p>
      <h1 className="section-title mt-2">Change password</h1>
      <p className="mt-2 text-sm text-muted">
        Updates your local sign-in password.{" "}
        <Link href="/admin" className="text-accent hover:underline">
          ← Studio desk
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-line bg-bg-elevated p-4">
        <div>
          <label htmlFor="currentPassword" className="mb-1 block text-xs text-muted">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="mb-1 block text-xs text-muted">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            className="input-field"
          />
          <p className="mt-1 text-xs text-muted">{PASSWORD_RULES_HINT}</p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-xs text-muted">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="input-field"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
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
