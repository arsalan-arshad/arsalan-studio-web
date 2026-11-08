"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { isAdmin, roleLabel } from "@/lib/roles";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  needs: unknown;
  message: string;
  status: string;
  createdAt: string;
  threadId: string | null;
};

type ThreadListItem = {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  client: { name: string; email: string };
  _count: { messages: number };
};

export function AdminDesk() {
  const { data: session } = useSession();
  const admin = isAdmin(session?.user?.role);
  const [tab, setTab] = useState<"threads" | "inquiries">(
    admin ? "threads" : "inquiries",
  );
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    if (admin) {
      const [tRes, iRes] = await Promise.all([
        fetch("/api/threads"),
        fetch("/api/admin/inquiries"),
      ]);
      const tData = await tRes.json();
      const iData = await iRes.json();
      if (!tRes.ok) {
        setError(tData.error || "Could not load threads");
        return;
      }
      if (!iRes.ok) {
        setError(iData.error || "Could not load inquiries");
        return;
      }
      setThreads(tData.threads);
      setInquiries(iData.inquiries);
      return;
    }

    const iRes = await fetch("/api/admin/inquiries");
    const iData = await iRes.json();
    if (!iRes.ok) {
      setError(iData.error || "Could not load inquiries");
      return;
    }
    setInquiries(iData.inquiries);
  }, [admin]);

  useEffect(() => {
    // Default tab once session role is known
    if (!admin) setTab("inquiries");
  }, [admin]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {admin ? "Admin only" : `${roleLabel("SUB_ADMIN")} desk`}
          </p>
          <h1 className="section-title mt-2">
            {admin ? "Studio desk" : "Inquiries inbox"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {admin ? (
              <>
                Inbox is scoped by <span className="text-ink">thread</span> (each
                client’s conversations). Messages are encrypted at rest for
                authorized participants.{" "}
                <Link href="/chat" className="text-accent hover:underline">
                  Open chat view
                </Link>
              </>
            ) : (
              <>
                Contact-form submissions only. Support accounts cannot open
                client chat threads or decrypt messages.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/users" className="btn-primary !py-2 text-sm">
            Manage users
          </Link>
          <Link href="/admin/settings" className="btn-ghost !py-2 text-sm">
            Password
          </Link>
        </div>
      </div>

      {admin ? (
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className={tab === "threads" ? "btn-primary !py-2 text-sm" : "btn-ghost !py-2 text-sm"}
            onClick={() => setTab("threads")}
          >
            Threads ({threads.length})
          </button>
          <button
            type="button"
            className={
              tab === "inquiries" ? "btn-primary !py-2 text-sm" : "btn-ghost !py-2 text-sm"
            }
            onClick={() => setTab("inquiries")}
          >
            Inquiries ({inquiries.length})
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      {admin && tab === "threads" ? (
        <ul className="mt-8 divide-y divide-line border border-line bg-bg-elevated">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/chat?thread=${t.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-bg"
              >
                <div>
                  <p className="font-medium text-ink">{t.subject}</p>
                  <p className="text-xs text-muted">
                    {t.client.name} · {t.client.email} · {t._count.messages} messages
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {t.status}
                </span>
              </Link>
            </li>
          ))}
          {!threads.length ? (
            <li className="px-4 py-8 text-sm text-muted">No threads yet.</li>
          ) : null}
        </ul>
      ) : (
        <ul className="mt-8 space-y-3">
          {inquiries.map((inq) => (
            <li key={inq.id} className="border border-line bg-bg-elevated p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">
                    {inq.name}{" "}
                    <span className="text-sm font-normal text-muted">({inq.email})</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(inq.createdAt).toLocaleString()} · {inq.status}
                    {inq.company ? ` · ${inq.company}` : ""}
                  </p>
                </div>
                {admin && inq.threadId ? (
                  <Link
                    href={`/chat?thread=${inq.threadId}`}
                    className="text-xs text-accent hover:underline"
                  >
                    Open thread
                  </Link>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-muted">
                Needs:{" "}
                {Array.isArray(inq.needs) ? inq.needs.join(", ") || "—" : "—"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{inq.message}</p>
            </li>
          ))}
          {!inquiries.length ? (
            <li className="text-sm text-muted">No inquiries yet.</li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
