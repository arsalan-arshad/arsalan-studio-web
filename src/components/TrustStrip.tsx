import { presenceLinks } from "@/data/links";
import { brand } from "@/lib/brand";

const stripIds = [
  "toptal",
  "upwork",
  "fiverr",
  "clutch",
  "github",
  "linkedin",
] as const;

export function TrustStrip() {
  const links = stripIds
    .map((id) => presenceLinks.find((l) => l.id === id))
    .filter(Boolean);

  return (
    <section
      aria-label="Where you can find Arsalan"
      className="border-y border-line bg-bg-elevated/80"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-[clamp(1.25rem,4vw,3.5rem)] py-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Also live on
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {links.map((link) =>
            link ? (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-ink/80 underline-offset-4 transition-colors hover:text-accent hover:underline"
                title={link.note}
              >
                {link.id === "clutch" ? "Clutch" : link.label}
              </a>
            ) : null,
          )}
        </div>
        <p className="text-xs text-muted sm:ml-auto">
          Studio · {brand.domain}
        </p>
      </div>
    </section>
  );
}
