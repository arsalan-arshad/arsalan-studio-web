"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PASSWORD_RULES_HINT } from "@/lib/password";

type TokenPeek =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      userId: string;
      email: string;
      name: string;
      purpose: string;
    };

export function ResetPasswordForm({
  mode = "reset",
}: {
  mode?: "reset" | "invite";
}) {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { data: session, status: sessionStatus } = useSession();
  const [peek, setPeek] = useState<TokenPeek>(() =>
    token ? { status: "loading" } : { status: "missing" },
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const isInvite = mode === "invite";

  const returnPath = useMemo(() => {
    const path = isInvite ? "/set-password" : "/reset-password";
    return token ? `${path}?token=${encodeURIComponent(token)}` : path;
  }, [isInvite, token]);

  useEffect(() => {
    if (!token) {
      setPeek({ status: "missing" });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
        );
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setPeek({
            status: "error",
            message: data.error || "Invalid or expired link",
          });
          return;
        }
        setPeek({
          status: "ok",
          userId: data.userId,
          email: data.email,
          name: data.name,
          purpose: data.purpose,
        });
      } catch {
        if (!cancelled) {
          setPeek({
            status: "error",
            message: "Could not validate this link. Try again.",
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const sessionMismatch =
    peek.status === "ok" &&
    sessionStatus === "authenticated" &&
    Boolean(session?.user?.id) &&
    session!.user.id !== peek.userId;

  async function onLogout() {
    setLoggingOut(true);
    await signOut({ redirect: false });
    // Stay on this page with the same token so the invitee/reset form appears
    router.replace(returnPath);
    router.refresh();
    setLoggingOut(false);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || peek.status !== "ok") return;
    if (sessionMismatch) return;

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
      if (!res.ok) {
        setLoading(false);
        setError(data.error || "Could not reset password");
        return;
      }

      if (data.bootstrapToken) {
        // Drop any existing session, then sign in as the token owner
        if (sessionStatus === "authenticated") {
          await signOut({ redirect: false });
        }
        const login = await signIn("credentials", {
          bootstrapToken: data.bootstrapToken,
          redirect: false,
        });
        if (!login?.error) {
          router.push("/chat");
          router.refresh();
          return;
        }
      }

      setLoading(false);
      router.push(isInvite ? "/login?invited=1" : "/login?reset=1");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Something went wrong. Try again.");
    }
  }

  if (peek.status === "missing") {
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

  if (peek.status === "loading" || sessionStatus === "loading") {
    return (
      <p className="mx-auto max-w-md text-center text-muted">Checking link…</p>
    );
  }

  if (peek.status === "error") {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-sm text-danger">{peek.message}</p>
        {sessionStatus === "authenticated" ? (
          <p className="text-sm text-muted">
            You’re still signed in as {session?.user?.email}. This link can’t be
            used.
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Log in
          </Link>
          {isInvite ? null : (
            <Link href="/forgot-password" className="btn-ghost">
              Request new link
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (sessionMismatch) {
    const signedInAs = session?.user?.email || session?.user?.name || "another account";
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="rounded-sm border border-line bg-bg-elevated px-3 py-3 text-sm text-ink">
          You’re signed in as <span className="font-medium">{signedInAs}</span>.
          Log out to finish this {isInvite ? "invite" : "password reset"} for{" "}
          <span className="font-medium">{peek.email}</span>.
        </p>
        <button
          type="button"
          className="btn-primary w-full"
          disabled={loggingOut}
          onClick={onLogout}
        >
          {loggingOut ? "Logging out…" : "Log out to continue"}
        </button>
        <p className="text-center text-sm text-muted">
          <Link href="/chat" className="text-accent hover:underline">
            Stay signed in → Messages
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      {sessionStatus === "authenticated" && peek.userId === session?.user?.id ? (
        <p className="rounded-sm border border-accent/40 bg-accent-wash px-3 py-2 text-sm text-ink">
          Finishing setup for {peek.email}.
        </p>
      ) : (
        <p className="text-sm text-muted">
          {isInvite
            ? `Set a password for ${peek.email}.`
            : `Choose a new password for ${peek.email}.`}
        </p>
      )}
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
        {loading
          ? "Saving…"
          : isInvite
            ? "Set password & continue"
            : "Set new password"}
      </button>
      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          Back to log in
        </Link>
      </p>
    </form>
  );
}
