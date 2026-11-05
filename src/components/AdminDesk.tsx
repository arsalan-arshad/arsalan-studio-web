"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
  const [tab, setTab] = useState<"threads" | "inquiries">("threads");
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
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
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin only</p>
          <h1 className="section-title mt-2">Studio desk</h1>
          <p className="mt-2 text-sm text-muted">
            All client threads and public inquiries.{" "}
            <Link href="/chat" className="text-accent hover:underline">
              Open chat view
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
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
      </div>

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      {tab === "threads" ? (
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
                {inq.threadId ? (
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
