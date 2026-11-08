"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { canAccessClientChat, isAdmin, isStaff } from "@/lib/roles";

export function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-sm text-muted">…</span>;
  }

  if (!session?.user) {
    return (
      <>
        <Link href="/login" className="btn-ghost !px-2.5 !py-1.5 text-sm">
          Log in
        </Link>
        <Link href="/signup" className="btn-ghost !px-2.5 !py-1.5 text-sm">
          Sign up
        </Link>
        <Link href="/contact" className="btn-primary !px-2.5 !py-1.5 text-sm">
          Get started
        </Link>
      </>
    );
  }

  const role = session.user.role;
  const showChat = canAccessClientChat(role);
  const staff = isStaff(role);

  return (
    <>
      {showChat ? (
        <Link href="/chat" className="btn-ghost !px-2.5 !py-1.5 text-sm">
          Messages
        </Link>
      ) : null}
      {staff ? (
        <>
          <Link href="/admin" className="btn-ghost !px-2.5 !py-1.5 text-sm">
            {isAdmin(role) ? "Admin" : "Support"}
          </Link>
          {isAdmin(role) ? (
            <Link href="/admin/users" className="btn-ghost !px-2.5 !py-1.5 text-sm">
              Users
            </Link>
          ) : (
            <Link href="/admin/users" className="btn-ghost !px-2.5 !py-1.5 text-sm">
              Invite
            </Link>
          )}
        </>
      ) : null}
      <button
        type="button"
        className="btn-ghost !px-2.5 !py-1.5 text-sm"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Log out
      </button>
    </>
  );
}
