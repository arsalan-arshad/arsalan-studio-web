"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/UserAvatar";
import { formatUserLocation } from "@/lib/format-location";
import { formatLastSeen, isUserOnline } from "@/lib/format-presence";
import { canDeactivateTarget, roleLabel, type AppRole } from "@/lib/roles";

type AccountType = "password" | "google" | "both" | "none";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  active: boolean;
  emailVerified: string | null;
  country?: string | null;
  city?: string | null;
  image?: string | null;
  lastLoginAt?: string | null;
  lastSeenAt?: string | null;
  createdAt: string;
  hasPassword: boolean;
  hasGoogle?: boolean;
  accountType?: AccountType;
  accountTypeLabel?: string;
  threadCount?: number;
  threadId?: string | null;
  reminderEmailSentAt?: string | null;
};

function formatCreatedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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
  const router = useRouter();
  const selfId = session?.user?.id;
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [inviteRoles, setInviteRoles] = useState<AppRole[]>(["CLIENT"]);
  const [canDelete, setCanDelete] = useState(false);
  const [canToggleActive, setCanToggleActive] = useState(false);
  const [canStartConversation, setCanStartConversation] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);

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
    setInviteRoles(
      Array.isArray(data.inviteRoles) && data.inviteRoles.length
        ? data.inviteRoles
        : ["CLIENT"],
    );
    setCanDelete(Boolean(data.canDelete));
    setCanToggleActive(Boolean(data.canToggleActive));
    setCanStartConversation(Boolean(data.canStartConversation));
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
    if (!canDelete || user.id === selfId) return;
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

  async function onStartConversation(user: AdminUserRow) {
    if (!canStartConversation || user.role !== "CLIENT" || !user.active) return;
    setStartingId(user.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start conversation");
        return;
      }
      const threadId = typeof data.threadId === "string" ? data.threadId : null;
      if (!threadId) {
        setError("Conversation started but no thread id was returned");
        return;
      }
      if (data.created) {
        setNotice(
          data.emailSent
            ? `Started conversation with ${user.email} and sent email.`
            : `Started conversation with ${user.email}. Email skipped (check RESEND_API_KEY).`,
        );
      }
      router.push(`/chat?thread=${encodeURIComponent(threadId)}`);
    } catch {
      setError("Could not start conversation");
    } finally {
      setStartingId(null);
    }
  }

  async function onSendReminder(user: AdminUserRow) {
    if (!canStartConversation || user.role !== "CLIENT" || !user.active) return;
    if (!user.threadId) return;
    if (user.reminderEmailSentAt) return;
    setRemindingId(user.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reminder`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send reminder");
        return;
      }
      if (data.alreadySent) {
        setNotice(`Reminder was already sent to ${user.email}.`);
      } else if (data.emailSent) {
        setNotice(`Reminder email sent to ${user.email}.`);
      } else {
        setNotice(
          `Reminder not sent for ${user.email} (check RESEND_API_KEY). Flag was not set.`,
        );
      }
      await load();
    } catch {
      setError("Could not send reminder");
    } finally {
      setRemindingId(null);
    }
  }

  async function onToggleActive(user: AdminUserRow) {
    if (!canToggleActive || !canDeactivateTarget(user.role) || user.id === selfId) {
      return;
    }
    const next = !user.active;
    const ok = window.confirm(
      next
        ? `Reactivate ${user.name} (${user.email})? They will be able to sign in again.`
        : `Deactivate ${user.name} (${user.email})? They will not be able to sign in until reactivated.`,
    );
    if (!ok) return;
    setTogglingId(user.id);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      setNotice(
        next
          ? `Reactivated ${user.email}.`
          : `Deactivated ${user.email}. Refresh tokens revoked.`,
      );
      await load();
    } catch {
      setError("Update failed");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Staff</p>
          <h1 className="section-title mt-2">Users</h1>
          <p className="mt-2 text-sm text-muted">
            Invite by email (7-day set-password link).{" "}
            {!canDelete
              ? "Support can invite CLIENT or SUB_ADMIN; only Admin can delete or deactivate."
              : "Admin can invite any role, deactivate Support/Client accounts, and delete users."}{" "}
            Location fills from edge geo headers on signup/login when available.{" "}
            <Link href="/admin" className="text-accent hover:underline">
              ← Studio desk
            </Link>
            {" · "}
            <Link href="/admin/settings" className="text-accent hover:underline">
              Password
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
            {inviteRoles.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)} ({r})
              </option>
            ))}
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
          <table className="w-full min-w-[68rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Location</th>
                <th className="px-3 py-2 font-semibold">Sign-in</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Last login</th>
                <th className="px-3 py-2 font-semibold">Created</th>
                <th className="px-3 py-2 font-semibold"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const toggleable =
                  canToggleActive &&
                  canDeactivateTarget(u.role) &&
                  u.id !== selfId;
                const canMessage =
                  canStartConversation && u.role === "CLIENT" && u.active;
                const hasThread = Boolean(u.threadId) || (u.threadCount ?? 0) > 0;
                const reminderSent = Boolean(u.reminderEmailSentAt);
                const hasActions = toggleable || canDelete || canMessage;
                const location = formatUserLocation(u);
                const online = isUserOnline(u.lastSeenAt);
                return (
                  <tr key={u.id} className="hover:bg-bg">
                    <td className="px-3 py-2.5 font-medium text-ink">
                      <span className="inline-flex items-center gap-2">
                        <UserAvatar
                          name={u.name}
                          image={u.image}
                          lastSeenAt={u.lastSeenAt}
                          showPresence
                        />
                        <span>
                          {u.name}
                          {online ? (
                            <span className="mt-0.5 block text-[11px] font-normal text-[color:var(--sage)]">
                              Online
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted">{u.email}</td>
                    <td
                      className="px-3 py-2.5 text-muted"
                      title={
                        location
                          ? [u.city, u.country].filter(Boolean).join(" · ")
                          : "Blank until next signup/login with geo headers"
                      }
                    >
                      {location ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">{accountBadge(u)}</td>
                    <td className="px-3 py-2.5 text-muted">{roleLabel(u.role)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-block rounded-sm border px-1.5 py-0.5 text-[11px] font-medium ${
                          u.active
                            ? "border-sage/40 bg-[color-mix(in_oklab,var(--sage)_18%,transparent)] text-ink"
                            : "border-danger/40 bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-danger"
                        }`}
                      >
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2.5 whitespace-nowrap text-muted"
                      title={u.lastLoginAt ?? undefined}
                    >
                      {u.lastLoginAt ? formatCreatedAt(u.lastLoginAt) : "—"}
                      {u.lastSeenAt && !online ? (
                        <span className="mt-0.5 block text-[11px]">
                          {formatLastSeen(u.lastSeenAt)}
                        </span>
                      ) : null}
                    </td>
                    <td
                      className="px-3 py-2.5 whitespace-nowrap text-muted"
                      title={u.createdAt}
                    >
                      {formatCreatedAt(u.createdAt)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {canMessage ? (
                          <button
                            type="button"
                            className="btn-ghost !px-2 !py-1 text-xs text-accent disabled:opacity-40"
                            disabled={startingId === u.id}
                            title={
                              hasThread
                                ? "Open existing conversation"
                                : "Start a new conversation (emails the client)"
                            }
                            onClick={() => onStartConversation(u)}
                          >
                            {startingId === u.id
                              ? "Opening…"
                              : hasThread
                                ? "Open chat"
                                : "Start conversation"}
                          </button>
                        ) : null}
                        {canMessage && hasThread ? (
                          <button
                            type="button"
                            className="btn-ghost !px-2 !py-1 text-xs disabled:opacity-40"
                            disabled={reminderSent || remindingId === u.id}
                            title={
                              reminderSent
                                ? u.reminderEmailSentAt
                                  ? `Reminder sent ${formatCreatedAt(u.reminderEmailSentAt)}`
                                  : "Reminder already sent"
                                : "Send a one-time email asking them to rejoin chat"
                            }
                            onClick={() => onSendReminder(u)}
                          >
                            {remindingId === u.id
                              ? "Sending…"
                              : reminderSent
                                ? "Reminder sent"
                                : "Send reminder"}
                          </button>
                        ) : null}
                        {toggleable ? (
                          <button
                            type="button"
                            className="btn-ghost !px-2 !py-1 text-xs disabled:opacity-40"
                            disabled={togglingId === u.id}
                            onClick={() => onToggleActive(u)}
                          >
                            {togglingId === u.id
                              ? "Saving…"
                              : u.active
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className="btn-ghost !px-2 !py-1 text-xs text-danger disabled:opacity-40"
                            disabled={u.id === selfId || deletingId === u.id}
                            title={
                              u.id === selfId
                                ? "Cannot delete yourself"
                                : "Delete user"
                            }
                            onClick={() => onDelete(u)}
                          >
                            {deletingId === u.id ? "Deleting…" : "Delete"}
                          </button>
                        ) : !hasActions ? (
                          <span className="text-xs text-muted">—</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!users.length ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-muted">
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
