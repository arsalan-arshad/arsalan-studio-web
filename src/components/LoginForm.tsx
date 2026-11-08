"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/chat";
  const showVerifyHint = params.get("verify") === "1";
  const resetOk = params.get("reset") === "1";
  const invitedOk = params.get("invited") === "1";
  const oauthError = params.get("error");
  const [error, setError] = useState(() => {
    if (oauthError === "GoogleEmailNotVerified") {
      return "Google sign-in requires a verified Google email. Verify it in your Google account, or use email and password.";
    }
    if (oauthError === "GoogleEmailMissing") {
      return "Google did not provide an email. Try again or use email and password.";
    }
    if (oauthError === "AccountInactive") {
      return "This account has been deactivated. Contact the studio admin if you need access restored.";
    }
    if (oauthError && oauthError !== "CredentialsSignin") {
      return "Google sign-in was cancelled or failed. Try again.";
    }
    return "";
  });
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
      {invitedOk ? (
        <p className="rounded-sm border border-accent/40 bg-accent-wash px-3 py-2 text-sm text-ink">
          Password set. Log in with your email and new password.
        </p>
      ) : null}
      {googleEnabled ? (
        <GoogleSignInButton callbackUrl={callbackUrl} disabled={loading} />
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
