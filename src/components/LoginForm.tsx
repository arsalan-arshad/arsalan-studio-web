"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/chat";
  const showVerifyHint = params.get("verify") === "1";
  const resetOk = params.get("reset") === "1";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      {showVerifyHint ? (
        <p className="rounded-sm border border-accent/40 bg-accent-wash px-3 py-2 text-sm text-ink">
          Check your inbox for a verification link before using Messages.
        </p>
      ) : null}
      {resetOk ? (
        <p className="rounded-sm border border-accent/40 bg-accent-wash px-3 py-2 text-sm text-ink">
          Password updated. Log in with your new password.
        </p>
      ) : null}
      {googleEnabled ? (
        <button
          type="button"
          className="btn-ghost w-full"
          disabled={loading}
          onClick={() => signIn("google", { callbackUrl })}
        >
          Continue with Google
        </button>
      ) : null}
      {googleEnabled ? (
        <p className="text-center text-xs text-muted">or email</p>
      ) : null}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input-field"
          autoComplete="email"
        />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label htmlFor="password" className="block text-sm text-muted">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={1}
          className="input-field"
          autoComplete="current-password"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link href="/signup" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
