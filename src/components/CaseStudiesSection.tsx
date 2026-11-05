import { CaseStudyVisual } from "@/components/CaseStudyVisual";
import {
  caseStudies,
  statusLabel,
  type CaseStudy,
} from "@/data/caseStudies";
import Link from "next/link";

const categories = [
  { key: "shopify" as const, label: "Shopify" },
  { key: "salesforce" as const, label: "Salesforce" },
  { key: "other" as const, label: "Other" },
];

function ProjectLinks({ study }: { study: CaseStudy }) {
  const links = [
    study.githubHref
      ? { href: study.githubHref, label: "GitHub" }
      : null,
    study.liveHref
      ? { href: study.liveHref, label: study.liveLabel ?? "Live" }
      : null,
    study.demoHref
      ? { href: study.demoHref, label: study.demoLabel ?? "Demo" }
      : null,
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      <Link
        href={`/work/${study.id}`}
        className="font-semibold text-accent underline-offset-4 hover:underline"
      >
        Know more
      </Link>
      {links.map((link) => (
        <a
          key={link.label + link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function CaseStudiesSection({
  limit,
  ensureAllSalesforce = false,
  showBanners = false,
}: {
  limit?: number;
  ensureAllSalesforce?: boolean;
  showBanners?: boolean;
}) {
  let items = caseStudies;
  if (limit != null) {
    if (ensureAllSalesforce) {
      const sf = caseStudies.filter((c) => c.category === "salesforce");
      const rest = caseStudies.filter((c) => c.category !== "salesforce");
      const restBudget = Math.max(0, limit - sf.length);
      items = [...rest.slice(0, restBudget), ...sf];
    } else {
      items = caseStudies.slice(0, limit);
    }
  }

  return (
    <section id="work" className="section-pad border-t border-line scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Featured work</p>
            <h2 className="section-title mt-3">Case studies & launches</h2>
            <p className="mt-4 max-w-xl text-muted">
              Open-source by default —{" "}
              <span className="text-ink">MIT where noted</span>, open for PRs.
              Tap <span className="text-ink">Know more</span> for the full
              case study; GitHub / Live / Demo stay as separate actions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/work/salesforce-demo" className="btn-ghost text-sm">
              Salesforce demos
            </Link>
            {limit ? (
              <Link href="/work" className="btn-ghost text-sm">
                View all work
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-12 space-y-14">
          {categories.map((cat) => {
            const group = items.filter((c) => c.category === cat.key);
            if (!group.length) return null;
            return (
              <div
                key={cat.key}
                id={cat.key === "salesforce" ? "salesforce" : undefined}
              >
                <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-[0.14em] text-sage">
                  {cat.label}
                  {cat.key === "salesforce" ? (
                    <span className="ml-2 font-[family-name:var(--font-body)] text-xs font-medium normal-case tracking-normal text-muted">
                      Full suite · {group.length} packages
                    </span>
                  ) : null}
                </h3>
                <ul className="mt-5 divide-y divide-line border-y border-line">
                  {group.map((study) => (
                    <li key={study.id} className="py-5">
                      {showBanners && study.bannerSrc ? (
                        <Link
                          href={`/work/${study.id}`}
                          className="relative mb-4 block h-28 overflow-hidden rounded-md border border-line bg-bg-elevated sm:h-36"
                        >
                          <CaseStudyVisual
                            study={study}
                            banner
                            fit="cover"
                            className="h-full w-full"
                          />
                        </Link>
                      ) : null}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                        <div className="flex min-w-0 flex-1 gap-4">
                          <Link href={`/work/${study.id}`}>
                            <CaseStudyVisual study={study} />
                          </Link>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <Link
                                href={`/work/${study.id}`}
                                className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight hover:text-accent"
                              >
                                {study.title}
                              </Link>
                              <span className="text-xs uppercase tracking-wider text-accent">
                                {statusLabel[study.status]}
                              </span>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm text-muted">
                              {study.blurb}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 sm:pt-1">
                          <ProjectLinks study={study} />
                        </div>
                      </div>
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
