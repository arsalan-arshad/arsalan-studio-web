"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PASSWORD_RULES_HINT } from "@/lib/password";

export function ResetPasswordForm({
  mode = "reset",
}: {
  mode?: "reset" | "invite";
}) {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isInvite = mode === "invite";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError(
        isInvite
          ? "Missing invite token. Ask an admin to resend your invite."
          : "Missing reset token. Use the link from your email.",
      );
      return;
    }
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));
    if (password !== confirm) {
      setLoading(false);
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Could not reset password");
        return;
      }
      router.push(isInvite ? "/login?invited=1" : "/login?reset=1");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Something went wrong. Try again.");
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-danger text-sm">
          {isInvite
            ? "Missing invite token. Ask an admin to send a new invite."
            : "Missing reset token. Request a new link from the login page."}
        </p>
        <Link
          href={isInvite ? "/login" : "/forgot-password"}
          className="btn-primary inline-flex"
        >
          {isInvite ? "Log in" : "Forgot password"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-muted">
          {isInvite ? "Password" : "New password"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={10}
          className="input-field"
          autoComplete="new-password"
        />
        <p className="mt-1.5 text-xs text-muted">{PASSWORD_RULES_HINT}</p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm text-muted">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={10}
          className="input-field"
          autoComplete="new-password"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Saving…" : isInvite ? "Set password & continue" : "Set new password"}
      </button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
