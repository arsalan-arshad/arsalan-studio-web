"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export function VerifyEmailBanner({ compact = false }: { compact?: boolean }) {
  const { data: session, update } = useSession();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const user = session?.user;
  if (!user || user.role === "ADMIN" || user.isEmailVerified) return null;

  async function resend() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.alreadyVerified) {
        await update();
        setMsg("Already verified — refreshing…");
        return;
      }
      if (!res.ok) {
        setMsg(data.error || "Could not resend");
        return;
      }
      setMsg("Verification email sent. Check your inbox.");
    } catch {
      setMsg("Could not resend");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={
        compact
          ? "rounded-sm border border-accent/40 bg-accent-wash px-3 py-2 text-sm"
          : "mx-auto mb-6 max-w-6xl rounded-sm border border-accent/40 bg-accent-wash px-[clamp(1.25rem,4vw,3.5rem)] py-4"
      }
    >
      <p className="font-medium text-ink">
        Verify your email to unlock Messages.
      </p>
      <p className="mt-1 text-sm text-muted">
        We sent a link to <span className="text-ink">{user.email}</span>. Didn’t
        get it?
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-primary !py-1.5 !px-3 text-sm"
          onClick={resend}
          disabled={busy}
        >
          {busy ? "Sending…" : "Resend verification"}
        </button>
        {msg ? <span className="text-sm text-muted">{msg}</span> : null}
      </div>
    </div>
  );
}
