import {
  categoryLabel,
  studiesByCategory,
  type CaseStudy,
} from "@/data/caseStudies";
import {
  CaseStudyCategoryTabs,
  type CaseStudyCategoryTab,
} from "@/components/CaseStudyCategoryTabs";
import Link from "next/link";
import { Suspense } from "react";

const categoryKeys = ["ai", "shopify", "salesforce", "other"] as const;

function homePreviewForCategory(category: CaseStudy["category"]): CaseStudy[] {
  const sorted = studiesByCategory(category);
  if (sorted.length <= 3) return sorted;
  return sorted.slice(0, 3);
}

function panelEyebrow(key: CaseStudy["category"], count: number): string | undefined {
  if (key === "salesforce") {
    return `Full suite · ${count} packages`;
  }
  if (key === "other") {
    return "npm · hosted · open source";
  }
  return undefined;
}

function buildTabs(mode: "home" | "full"): CaseStudyCategoryTab[] {
  return categoryKeys.map((key) => {
    const allInCategory = studiesByCategory(key);
    const studies =
      mode === "home" ? homePreviewForCategory(key) : allInCategory;
    return {
      key,
      label: categoryLabel[key],
      studies,
      totalCount: allInCategory.length,
      panelEyebrow: panelEyebrow(key, allInCategory.length),
    };
  });
}

export function CaseStudiesSection({
  mode = "full",
}: {
  /** Home shows up to three studies per category; /work shows full lists. */
  mode?: "home" | "full";
}) {
  const tabs = buildTabs(mode);

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
              Tap <span className="text-ink">Know more</span> for the full case
              study; GitHub / Live / Demo / YouTube stay as separate actions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/work/salesforce-demo" className="btn-ghost text-sm">
              Salesforce demos
            </Link>
            {mode === "home" ? (
              <Link href="/work" className="btn-ghost text-sm">
                View all work
              </Link>
            ) : null}
          </div>
        </div>

        <Suspense
          fallback={
            <p className="mt-12 text-sm text-muted">Loading projects…</p>
          }
        >
          <CaseStudyCategoryTabs tabs={tabs} mode={mode} />
        </Suspense>
      </div>
    </section>
  );
}