"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { update, status } = useSession();
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
        if (status === "authenticated") {
          await update();
        }
        setState("ok");
        setMessage("Email verified. You can use Messages now.");
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
  }, [token, status, update]);

  return (
    <div className="mt-6 space-y-4">
      {state === "loading" ? (
        <p className="text-muted">Verifying…</p>
      ) : (
        <p className={state === "ok" ? "text-ink" : "text-danger"}>{message}</p>
      )}
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
