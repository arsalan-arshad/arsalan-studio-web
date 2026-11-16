"use client";

import { useEffect } from "react";

const HEARTBEAT_MS = 30_000;

/** Ping /api/presence/heartbeat while the caller stays mounted and enabled. */
export function usePresenceHeartbeat(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function beat() {
      if (cancelled || document.visibilityState === "hidden") return;
      try {
        await fetch("/api/presence/heartbeat", { method: "POST" });
      } catch {
        /* ignore transient network errors */
      }
    }

    void beat();
    const id = window.setInterval(() => void beat(), HEARTBEAT_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void beat();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled]);
}
