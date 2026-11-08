"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=12");
      const data = await res.json();
      if (data.ok) {
        setItems(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      /* ignore transient errors */
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status !== "authenticated") return;
    void load();
    const id = window.setInterval(() => void load(), 45_000);
    return () => window.clearInterval(id);
  }, [status, load]);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status !== "authenticated" || !session?.user) return null;

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* ignore */
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setItems((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }

  const badge =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="btn-ghost relative !px-2.5 !py-1.5 text-sm"
        aria-label={
          badge ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
      >
        <BellIcon />
        {badge ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-sm bg-accent px-0.5 text-[0.65rem] font-semibold text-on-accent">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="panel-lume absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden shadow-[0_16px_40px_rgba(30,35,43,0.35)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="text-xs text-accent hover:underline"
                  onClick={() => void markAllRead()}
                >
                  Mark all read
                </button>
              ) : null}
              <Link
                href="/notifications"
                className="text-xs text-muted hover:text-accent"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            </div>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted">Loading…</li>
            ) : null}
            {!loading && items.length === 0 ? (
              <li className="px-3 py-4 text-sm text-muted">You&apos;re all caught up.</li>
            ) : null}
            {items.map((n) => {
              const unread = !n.readAt;
              const content = (
                <>
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>
                  <p className="mt-1 text-[0.65rem] text-muted/80">
                    {formatRelative(n.createdAt)}
                  </p>
                </>
              );
              return (
                <li
                  key={n.id}
                  className={`border-b border-line last:border-0 ${
                    unread ? "bg-accent-wash/40" : ""
                  }`}
                >
                  {n.href ? (
                    <Link
                      href={n.href}
                      className="block px-3 py-2.5 transition-colors hover:bg-accent-wash/50"
                      onClick={() => {
                        if (unread) void markRead(n.id);
                        setOpen(false);
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="block w-full px-3 py-2.5 text-left transition-colors hover:bg-accent-wash/50"
                      onClick={() => {
                        if (unread) void markRead(n.id);
                      }}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M6 9a6 6 0 1 1 12 0c0 3.2.8 4.6 1.5 5.5.3.4 0 1-.5 1H5c-.5 0-.8-.6-.5-1C5.2 13.6 6 12.2 6 9Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
