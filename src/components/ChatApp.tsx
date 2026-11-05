"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ThreadListItem = {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
  client: { name: string; email: string };
  messages: { body: string; createdAt: string }[];
  _count: { messages: number };
};

type Message = {
  id: string;
  body: string;
  createdAt: string;
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  sender: { id: string; name: string; role: string };
};

type ThreadDetail = {
  id: string;
  subject: string;
  status: string;
  client: { name: string; email: string };
  messages: Message[];
};

export function ChatApp() {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const [threads, setThreads] = useState<ThreadListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(params.get("thread"));
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [error, setError] = useState("");
  const isAdmin = session?.user?.role === "ADMIN";

  const loadThreads = useCallback(async () => {
    const res = await fetch("/api/threads");
    const data = await res.json();
    if (res.ok) setThreads(data.threads);
  }, []);

  const loadThread = useCallback(async (id: string) => {
    const res = await fetch(`/api/threads/${id}`);
    const data = await res.json();
    if (res.ok) setThread(data.thread);
  }, []);

  useEffect(() => {
    if (status === "authenticated") loadThreads();
  }, [status, loadThreads]);

  useEffect(() => {
    const fromQuery = params.get("thread");
    if (fromQuery) setActiveId(fromQuery);
  }, [params]);

  useEffect(() => {
    if (!activeId) return;
    loadThread(activeId);
    const t = setInterval(() => loadThread(activeId), 4000);
    return () => clearInterval(t);
  }, [activeId, loadThread]);

  async function createThread(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: newSubject, body: newBody }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not create");
      return;
    }
    setNewSubject("");
    setNewBody("");
    await loadThreads();
    setActiveId(data.thread.id);
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!activeId || !replyBody.trim()) return;
    const res = await fetch(`/api/threads/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyBody }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Send failed");
      return;
    }
    setReplyBody("");
    await loadThread(activeId);
    await loadThreads();
  }

  async function setStatus(next: string) {
    if (!activeId || !isAdmin) return;
    await fetch(`/api/threads/${activeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await loadThread(activeId);
    await loadThreads();
  }

  if (status === "loading") {
    return <p className="text-muted px-[clamp(1.25rem,4vw,3.5rem)]">Loading session…</p>;
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <p className="text-muted">
          Sign in to chat about briefs, files, and project status.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login?callbackUrl=/chat" className="btn-primary">
            Log in
          </Link>
          <Link href="/signup" className="btn-ghost">
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-[clamp(1.25rem,4vw,3.5rem)] lg:grid-cols-[280px_1fr]">
      <aside className="border border-line bg-bg-elevated p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {isAdmin ? "Admin inbox" : "Your threads"}
        </p>
        <ul className="mt-3 space-y-2">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`w-full rounded-sm border px-3 py-2 text-left text-sm ${
                  activeId === t.id
                    ? "border-accent bg-accent-wash"
                    : "border-line hover:bg-bg"
                }`}
              >
                <span className="font-medium text-ink line-clamp-1">{t.subject}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {t.status}
                  {isAdmin ? ` · ${t.client.name}` : ""} · {t._count.messages} msgs
                </span>
              </button>
            </li>
          ))}
          {!threads.length ? (
            <li className="text-sm text-muted">No threads yet.</li>
          ) : null}
        </ul>

        {!isAdmin ? (
          <form onSubmit={createThread} className="mt-6 space-y-2 border-t border-line pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              New conversation
            </p>
            <input
              className="input-field"
              placeholder="Subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              required
            />
            <textarea
              className="input-field min-h-[5rem]"
              placeholder="First message"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary w-full !py-2 text-sm">
              Start thread
            </button>
          </form>
        ) : (
          <Link href="/admin" className="mt-4 inline-block text-sm text-accent hover:underline">
            Open admin desk →
          </Link>
        )}
      </aside>

      <section className="border border-line bg-bg-elevated p-4 min-h-[420px] flex flex-col">
        {!thread ? (
          <p className="text-muted m-auto text-sm">Select a thread</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                  {thread.subject}
                </h2>
                <p className="text-xs text-muted">
                  {thread.status} · {thread.client.name} ({thread.client.email})
                </p>
              </div>
              {isAdmin ? (
                <div className="flex gap-2">
                  {(["NEW", "ACTIVE", "CLOSED"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className="btn-ghost !px-2 !py-1 text-xs"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {thread.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-sm border border-line px-3 py-2 text-sm ${
                    m.sender.role === "ADMIN" ? "ml-auto bg-accent-wash" : "bg-bg"
                  }`}
                >
                  <p className="text-xs text-muted">
                    {m.sender.name}
                    {m.sender.role === "ADMIN" ? " · studio" : ""} ·{" "}
                    {new Date(m.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-ink">{m.body}</p>
                  {m.attachmentUrl ? (
                    <a
                      href={m.attachmentUrl}
                      className="mt-1 inline-block text-xs text-accent hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {m.attachmentName || "Attachment"}
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="border-t border-line pt-3 flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="Write a message…"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
              />
              <button type="submit" className="btn-primary !px-4">
                Send
              </button>
            </form>
            {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
          </>
        )}
      </section>
    </div>
  );
}
