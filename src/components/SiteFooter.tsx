import Link from "next/link";
import { footerNav, presenceLinks } from "@/data/links";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-bg-elevated">
      <div className="mx-auto grid max-w-6xl gap-10 px-[clamp(1.25rem,4vw,3.5rem)] py-12 lg:grid-cols-[1.2fr_1fr_1.4fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            {brand.name}
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Personal marketplace at {brand.domain} — inquire, chat daily, ship.
            Sole worker. Formerly Digitize Turf (
            <a
              href={brand.pastCompany.clutch}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              Clutch
            </a>
            ); brand is now fully under this studio.
          </p>
          <a
            href={`mailto:${brand.email}`}
            className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline"
          >
            {brand.email}
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Navigate
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            {footerNav.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Live presence
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
            {presenceLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
                title={link.note}
              >
                {link.id === "clutch" ? "Clutch" : link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
