"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

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

  const isAdmin = session.user.role === "ADMIN";

  return (
    <>
      <Link href="/chat" className="btn-ghost !px-2.5 !py-1.5 text-sm">
        Messages
      </Link>
      {isAdmin ? (
        <Link href="/admin" className="btn-ghost !px-2.5 !py-1.5 text-sm">
          Admin
        </Link>
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
