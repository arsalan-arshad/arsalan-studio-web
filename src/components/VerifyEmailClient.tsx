"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { update } = useSession();
  const attempted = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">(
    token ? "loading" : "idle",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("idle");
      setMessage("Missing verification token. Check your email for the link.");
      return;
    }
    // Run once — deps must not re-fire after success (status/update used to cause false "expired")
    if (attempted.current) return;
    attempted.current = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState("error");
          setMessage(data.error || "Could not verify email");
          return;
        }

        if (data.bootstrapToken) {
          const login = await signIn("credentials", {
            bootstrapToken: data.bootstrapToken,
            redirect: false,
          });
          if (login?.error) {
            // Verified in DB; user can still log in manually
            console.warn("[verify-email] bootstrap sign-in failed", login.error);
          } else {
            await update();
          }
        } else {
          await update();
        }

        setState("ok");
        setMessage(
          data.alreadyVerified
            ? "Email already verified. You’re signed in."
            : "Email verified. You’re signed in.",
        );
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Something went wrong. Try again.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, update]);

  return (
    <div className="mt-6 space-y-4">
      {state === "loading" ? (
        <p className="text-muted">Verifying…</p>
      ) : (
        <p className={state === "ok" ? "text-ink" : "text-danger"}>{message}</p>
      )}
      {state === "ok" ? (
        <p className="rounded-sm border border-accent/40 bg-accent-wash px-3 py-2 text-sm text-ink">
          Email verified — Messages are unlocked.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {state === "ok" ? (
          <Link href="/chat" className="btn-primary">
            Open Messages
          </Link>
        ) : null}
        {state === "error" || state === "idle" ? (
          <>
            <Link href="/login" className="btn-primary">
              Log in
            </Link>
            <Link href="/signup" className="btn-ghost">
              Sign up
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
