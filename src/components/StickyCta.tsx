"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

/** Hide marketing CTA on chat/admin once the visitor is signed in. */
function shouldHideStickyCta(pathname: string, authenticated: boolean) {
  if (!authenticated) return false;
  if (pathname === "/chat" || pathname.startsWith("/chat/")) return true;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true;
  return false;
}

export function StickyCta() {
  const pathname = usePathname() || "/";
  const { status } = useSession();
  const onAppSurface =
    pathname === "/chat" ||
    pathname.startsWith("/chat/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  // Avoid flashing the marketing CTA on chat/admin while session resolves
  if (onAppSurface && status !== "unauthenticated") {
    return null;
  }

  if (shouldHideStickyCta(pathname, status === "authenticated")) {
    return null;
  }

  return (
    <div className="sticky-cta flex items-center justify-between gap-3 md:justify-end">
      <p className="text-sm text-muted md:hidden">Ready when you are.</p>
      <Link href="/contact" className="btn-primary !px-4 !py-2.5 text-sm shrink-0">
        Start a conversation
      </Link>
    </div>
  );
}
