import { presenceLinks } from "@/data/links";
import { brand } from "@/lib/brand";

const groups = [
  {
    key: "social" as const,
    title: "Social & code",
    blurb: "Find me where the work and conversation already live.",
  },
  {
    key: "marketplace" as const,
    title: "Marketplaces",
    blurb: "Running profiles on Toptal, Upwork, and Fiverr — hire the same person.",
  },
  {
    key: "studio" as const,
    title: "Clutch",
    blurb: `Verified client reviews on Clutch under ${brand.name} — same builder as ${brand.domain}.`,
  },
  {
    key: "influencer" as const,
    title: "Stockroom Studio",
    blurb:
      "AI influencer characters and hub — labeled honestly as AI characters, not human creators.",
  },
];

export function PresenceSection() {
  return (
    <section id="presence" className="section-pad border-t border-line scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Presence</p>
        <h2 className="section-title mt-3">Connect — live pages & marketplaces</h2>
        <p className="mt-4 max-w-2xl text-muted">
          Running presence, not placeholders. Same builder across social,
          freelance marketplaces, Clutch reviews, and Stockroom Studio AI
          characters.
        </p>

        <div className="mt-12 space-y-12">
          {groups.map((group) => {
            const links = presenceLinks.filter((l) => l.group === group.key);
            if (!links.length) return null;
            return (
              <div key={group.key}>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
                  {group.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{group.blurb}</p>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {links.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-col gap-0.5 border border-line bg-bg-elevated px-4 py-3 transition-colors hover:border-accent/40 hover:bg-accent-wash"
                      >
                        <span className="text-sm font-semibold text-ink">
                          {link.label}
                        </span>
                        {link.note ? (
                          <span className="max-w-[14rem] text-xs text-muted">
                            {link.note}
                          </span>
                        ) : (
                          <span className="text-xs text-accent">Live →</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
