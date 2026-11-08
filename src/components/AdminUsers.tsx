"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type AccountType = "password" | "google" | "both" | "none";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN";
  emailVerified: string | null;
  createdAt: string;
  hasPassword: boolean;
  hasGoogle?: boolean;
  accountType?: AccountType;
  accountTypeLabel?: string;
};

function accountBadge(u: AdminUserRow) {
  const type = u.accountType ?? (u.hasPassword ? "password" : "none");
  const label =
    u.accountTypeLabel ??
    (type === "both"
      ? "Password + Google"
      : type === "google"
        ? "Google"
        : type === "password"
          ? "Password"
          : "Invite pending");
  return (
    <span
      className={`inline-block rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${
        type === "both"
          ? "border-accent/40 bg-accent-wash text-ink"
          : type === "google"
            ? "border-line bg-bg text-ink"
            : type === "password"
              ? "border-line bg-bg-elevated text-muted"
              : "border-line bg-bg text-muted"
      }`}
    >
      {label}
    </span>
  );
}

export function AdminUsers() {
  const { data: session } = useSession();
  const selfId = session?.user?.id;
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load users");
      setLoading(false);
      return;
    }
    setUsers(data.users);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onInvite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviting(true);
    setError("");
    setNotice("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      role: String(form.get("role") || "CLIENT"),
    };
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invite failed");
        return;
      }
      (e.target as HTMLFormElement).reset();
      if (data.inviteSent) {
        setNotice(`Invite sent to ${data.user.email}.`);
      } else if (data.inviteUrl) {
        setNotice(
          `User created. Email skipped (no RESEND_API_KEY) — share this link: ${data.inviteUrl}`,
        );
      } else {
        setNotice(`User created for ${data.user.email}. Invite email may have failed.`);
      }
      await load();
    } catch {
      setError("Invite failed");
    } finally {
      setInviting(false);
    }
  }

  async function onDelete(user: AdminUserRow) {
    if (user.id === selfId) return;
    const ok = window.confirm(
      `Delete ${user.name} (${user.email})?\n\nThis removes their threads, messages, and tokens. This cannot be undone.`,
    );
    if (!ok) return;
    setDeletingId(user.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Delete failed");
        return;
      }
      setNotice(`Deleted ${user.email}.`);
      await load();
    } catch {
      setError("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin only</p>
          <h1 className="section-title mt-2">Users</h1>
          <p className="mt-2 text-sm text-muted">
            Invite clients (or admins) by email. They get a 7-day link to set a
            password.{" "}
            <Link href="/admin" className="text-accent hover:underline">
              ← Studio desk
            </Link>
          </p>
        </div>
      </div>

      <form
        onSubmit={onInvite}
        className="mt-8 grid gap-3 border border-line bg-bg-elevated p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="sm:col-span-2 lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Invite user
          </p>
        </div>
        <div>
          <label htmlFor="invite-name" className="mb-1 block text-xs text-muted">
            Name
          </label>
          <input
            id="invite-name"
            name="name"
            required
            className="input-field"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="invite-email" className="mb-1 block text-xs text-muted">
            Email
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            className="input-field"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="invite-role" className="mb-1 block text-xs text-muted">
            Role
          </label>
          <select id="invite-role" name="role" className="input-field" defaultValue="CLIENT">
            <option value="CLIENT">CLIENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full" disabled={inviting}>
            {inviting ? "Sending…" : "Send invite"}
          </button>
        </div>
      </form>

      {notice ? (
        <p className="mt-4 break-all rounded-sm border border-accent/40 bg-accent-wash px-3 py-2 text-sm text-ink">
          {notice}
        </p>
      ) : null}
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      {loading ? (
        <p className="mt-8 text-sm text-muted">Loading users…</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-line bg-bg-elevated">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Sign-in</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Verified</th>
                <th className="px-3 py-2 font-semibold">Created</th>
                <th className="px-3 py-2 font-semibold"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-bg">
                  <td className="px-3 py-2.5 font-medium text-ink">{u.name}</td>
                  <td className="px-3 py-2.5 text-muted">{u.email}</td>
                  <td className="px-3 py-2.5">{accountBadge(u)}</td>
                  <td className="px-3 py-2.5 text-muted">{u.role}</td>
                  <td className="px-3 py-2.5 text-muted">
                    {u.emailVerified
                      ? new Date(u.emailVerified).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      className="btn-ghost !px-2 !py-1 text-xs text-danger disabled:opacity-40"
                      disabled={u.id === selfId || deletingId === u.id}
                      title={
                        u.id === selfId ? "Cannot delete yourself" : "Delete user"
                      }
                      onClick={() => onDelete(u)}
                    >
                      {deletingId === u.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-muted">
                    No users yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
