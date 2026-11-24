"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { footerNav } from "@/data/links";
import { canAccessClientChat, isAdmin, isStaff } from "@/lib/roles";

export function MobileNav() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.mobileNavOpen = "true";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      delete document.body.dataset.mobileNavOpen;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const role = session?.user?.role;
  const showChat = canAccessClientChat(role);
  const staff = isStaff(role);
  const admin = isAdmin(role);

  const overlay =
    open && mounted
      ? createPortal(
          <div
            id={panelId}
            className="fixed inset-x-0 bottom-0 top-[3.35rem] z-[60] overflow-y-auto border-t border-line/70 bg-white md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="mx-auto flex min-h-full max-w-6xl flex-col px-[clamp(1.25rem,4vw,3.5rem)] pb-28 pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Navigate
              </p>
              <nav className="mt-3 flex flex-col" aria-label="Mobile">
                {footerNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-b border-line/70 py-3 text-base text-ink transition-colors hover:text-accent"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 border-t border-line pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Account
                </p>
                <div className="mt-3 flex flex-col gap-1">
                  {status === "loading" ? (
                    <span className="py-2 text-sm text-muted">…</span>
                  ) : !session?.user ? (
                    <>
                      <Link
                        href="/login"
                        className="py-2.5 text-base text-ink hover:text-accent"
                        onClick={() => setOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        className="py-2.5 text-base text-ink hover:text-accent"
                        onClick={() => setOpen(false)}
                      >
                        Sign up
                      </Link>
                      <Link
                        href="/contact"
                        className="btn-primary mt-3 w-full"
                        onClick={() => setOpen(false)}
                      >
                        Get started
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/notifications"
                        className="py-2.5 text-base text-ink hover:text-accent"
                        onClick={() => setOpen(false)}
                      >
                        Notifications
                      </Link>
                      {showChat ? (
                        <Link
                          href="/chat"
                          className="py-2.5 text-base text-ink hover:text-accent"
                          onClick={() => setOpen(false)}
                        >
                          Messages
                        </Link>
                      ) : null}
                      {staff ? (
                        <>
                          <Link
                            href="/admin"
                            className="py-2.5 text-base text-ink hover:text-accent"
                            onClick={() => setOpen(false)}
                          >
                            {admin ? "Admin" : "Support"}
                          </Link>
                          {admin ? (
                            <>
                              <Link
                                href="/admin/users"
                                className="py-2.5 text-base text-ink hover:text-accent"
                                onClick={() => setOpen(false)}
                              >
                                Users
                              </Link>
                              <Link
                                href="/admin/email"
                                className="py-2.5 text-base text-ink hover:text-accent"
                                onClick={() => setOpen(false)}
                              >
                                Email
                              </Link>
                            </>
                          ) : (
                            <Link
                              href="/admin/users"
                              className="py-2.5 text-base text-ink hover:text-accent"
                              onClick={() => setOpen(false)}
                            >
                              Invite
                            </Link>
                          )}
                        </>
                      ) : null}
                      <button
                        type="button"
                        className="mt-2 py-2.5 text-left text-base text-ink hover:text-accent"
                        onClick={() => {
                          setOpen(false);
                          void signOut({ callbackUrl: "/" });
                        }}
                      >
                        Log out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="btn-ghost !px-2.5 !py-1.5 text-sm"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {overlay}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
