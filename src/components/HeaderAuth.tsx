"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { canAccessClientChat, isAdmin, isStaff, roleLabel } from "@/lib/roles";

export function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="hidden text-sm text-muted md:inline">…</span>;
  }

  if (!session?.user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link href="/login" className="btn-ghost !px-2.5 !py-1.5 text-sm">
          Log in
        </Link>
        <Link href="/signup" className="btn-ghost !px-2.5 !py-1.5 text-sm">
          Sign up
        </Link>
        <Link href="/contact" className="btn-primary !px-2.5 !py-1.5 text-sm">
          Get started
        </Link>
      </div>
    );
  }

  return <AccountMenu role={session.user.role} name={session.user.name} />;
}

function AccountMenu({
  role,
  name,
}: {
  role: string | null | undefined;
  name?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const showChat = canAccessClientChat(role);
  const staff = isStaff(role);
  const admin = isAdmin(role);
  const triggerLabel = staff ? roleLabel(role ?? "") : "Account";

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

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <button
        type="button"
        className="btn-ghost !px-2.5 !py-1.5 text-sm"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="max-w-[9rem] truncate">{triggerLabel}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="panel-lume absolute right-0 z-50 mt-2 w-56 overflow-hidden shadow-[0_16px_40px_rgba(15,20,25,0.12)]"
        >
          {name ? (
            <p className="truncate border-b border-line px-3 py-2.5 text-xs text-muted">
              {name}
            </p>
          ) : null}
          <div className="flex flex-col py-1">
            {showChat ? (
              <MenuLink href="/chat" onClick={() => setOpen(false)}>
                Messages
              </MenuLink>
            ) : null}
            {staff ? (
              <>
                <MenuLink href="/admin" onClick={() => setOpen(false)}>
                  {admin ? "Admin" : "Support"}
                </MenuLink>
                {admin ? (
                  <>
                    <MenuLink href="/admin/users" onClick={() => setOpen(false)}>
                      Users
                    </MenuLink>
                    <MenuLink href="/admin/email" onClick={() => setOpen(false)}>
                      Email
                    </MenuLink>
                  </>
                ) : (
                  <MenuLink href="/admin/users" onClick={() => setOpen(false)}>
                    Invite
                  </MenuLink>
                )}
              </>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className="w-full px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-accent-wash/50 hover:text-accent"
              onClick={() => {
                setOpen(false);
                void signOut({ callbackUrl: "/" });
              }}
            >
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="px-3 py-2 text-sm text-ink transition-colors hover:bg-accent-wash/50 hover:text-accent"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
