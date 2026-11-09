"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useEventSource } from "@/hooks/useEventSource";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

type StreamPayload = {
  ok?: boolean;
  notifications?: NotificationItem[];
  unreadCount?: number;
};

export function NotificationsPageClient() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const authenticated = status === "authenticated" && Boolean(session?.user);

  const applySnapshot = useCallback((data: StreamPayload) => {
    if (!data?.ok) return;
    setItems(data.notifications ?? []);
    setUnreadCount(data.unreadCount ?? 0);
    setLoading(false);
  }, []);

  useEventSource(
    authenticated ? "/api/notifications/stream?limit=80" : null,
    "notifications",
    (raw) => applySnapshot(raw as StreamPayload),
  );

  useEffect(() => {
    if (status === "authenticated") {
      void fetch("/api/notifications?limit=80")
        .then((res) => res.json())
        .then((data) => applySnapshot(data))
        .catch(() => setLoading(false));
    }
    if (status === "unauthenticated") setLoading(false);
  }, [status, applySnapshot]);

  if (status === "loading" || loading) {
    return (
      <p className="mx-auto max-w-3xl px-[clamp(1.25rem,4vw,3.5rem)] text-muted">
        Loading…
      </p>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl px-[clamp(1.25rem,4vw,3.5rem)]">
        <p className="text-muted">Sign in to view notifications.</p>
        <Link href="/login" className="btn-primary mt-4 inline-flex">
          Log in
        </Link>
      </div>
    );
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n,
      ),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setItems((prev) =>
      prev.map((n) => ({
        ...n,
        readAt: n.readAt ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  }

  return (
    <div className="mx-auto max-w-3xl px-[clamp(1.25rem,4vw,3.5rem)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        </p>
        {unreadCount > 0 ? (
          <button
            type="button"
            className="text-sm text-accent hover:underline"
            onClick={() => void markAllRead()}
          >
            Mark all read
          </button>
        ) : null}
      </div>
      <ul className="panel-lume divide-y divide-line overflow-hidden">
        {items.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted">No notifications yet.</li>
        ) : null}
        {items.map((n) => {
          const unread = !n.readAt;
          const inner = (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-ink">{n.title}</p>
                <time className="shrink-0 text-xs text-muted">
                  {new Date(n.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
              <p className="mt-2 text-[0.7rem] uppercase tracking-wider text-accent/80">
                {n.type.replace(/_/g, " ")}
              </p>
            </>
          );
          return (
            <li
              key={n.id}
              className={unread ? "bg-accent-wash/35" : undefined}
            >
              {n.href ? (
                <Link
                  href={n.href}
                  className="block px-4 py-4 transition-colors hover:bg-accent-wash/40"
                  onClick={() => {
                    if (unread) void markRead(n.id);
                  }}
                >
                  {inner}
                </Link>
              ) : (
                <button
                  type="button"
                  className="block w-full px-4 py-4 text-left transition-colors hover:bg-accent-wash/40"
                  onClick={() => {
                    if (unread) void markRead(n.id);
                  }}
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
