import Link from "next/link";
import { HeaderAuth } from "@/components/HeaderAuth";
import { brand } from "@/lib/brand";

const links = [
  { href: "/#offers", label: "Offers" },
  { href: "/work", label: "Work" },
  { href: "/#presence", label: "Presence" },
  { href: "/#experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
  { href: "/chat", label: "Messages" },
];

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 border-b border-line/60 bg-[color-mix(in_oklab,var(--bg)_55%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-[clamp(1.25rem,4vw,3.5rem)] py-3 sm:py-3.5">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-ink sm:text-[0.95rem]"
        >
          {brand.name}
        </Link>
        <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
