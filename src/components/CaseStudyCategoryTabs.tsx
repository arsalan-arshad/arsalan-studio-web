"use client";

import { CaseStudyVisual } from "@/components/CaseStudyVisual";
import { statusLabel, type CaseStudy } from "@/data/caseStudies";
import { InstallGuideUrl } from "@/lib/linkify";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export const WORK_CATEGORY_QUERY = "category";

const categoryKeys = [
  "products",
  "ai",
  "shopify",
  "salesforce",
  "other",
] as const;

function parseWorkCategory(
  value: string | null,
): CaseStudy["category"] | null {
  if (!value) return null;
  return categoryKeys.includes(value as CaseStudy["category"])
    ? (value as CaseStudy["category"])
    : null;
}

export type CaseStudyCategoryTab = {
  key: CaseStudy["category"];
  label: string;
  /** Projects shown in the active tab panel (preview or full list). */
  studies: CaseStudy[];
  /** Total projects in this category (for tab badges). */
  totalCount: number;
  panelEyebrow?: string;
};

function ProjectLinks({ study }: { study: CaseStudy }) {
  const links = [
    study.githubHref ? { href: study.githubHref, label: "GitHub" } : null,
    study.liveHref
      ? { href: study.liveHref, label: study.liveLabel ?? "Live" }
      : null,
    study.npmHref ? { href: study.npmHref, label: "npm" } : null,
    study.demoHref
      ? { href: study.demoHref, label: study.demoLabel ?? "Demo" }
      : null,
    study.youtubeHref
      ? { href: study.youtubeHref, label: study.youtubeLabel ?? "YouTube" }
      : null,
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="max-w-md space-y-2 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
      {study.installGuide ? (
        <div className="rounded-sm border border-line bg-bg-elevated/80 px-3 py-2 text-xs leading-relaxed text-muted">
          <p className="font-semibold text-ink">{study.installGuide.title}</p>
          <p className="mt-1">{study.installGuide.body}</p>
          <InstallGuideUrl
            url={study.installGuide.urlExample}
            className="mt-1.5 block break-all text-[0.7rem] text-accent underline-offset-2 hover:underline"
          />
        </div>
      ) : null}
    </div>
  );
}

function CaseStudyListItem({ study }: { study: CaseStudy }) {
  return (
    <li className="py-5">
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
            <p className="mt-2 max-w-2xl text-sm text-muted">{study.blurb}</p>
          </div>
        </div>
        <div className="shrink-0 sm:pt-1">
          <ProjectLinks study={study} />
        </div>
      </div>
    </li>
  );
}

export function CaseStudyCategoryTabs({
  tabs,
  mode = "full",
}: {
  tabs: CaseStudyCategoryTab[];
  mode?: "home" | "full";
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const populated = useMemo(
    () => tabs.filter((tab) => tab.totalCount > 0),
    [tabs],
  );

  const defaultKey = populated[0]?.key ?? "products";

  const [active, setActive] = useState<CaseStudy["category"]>(() => {
    const fromUrl = parseWorkCategory(searchParams.get(WORK_CATEGORY_QUERY));
    if (fromUrl && populated.some((tab) => tab.key === fromUrl)) {
      return fromUrl;
    }
    return defaultKey;
  });

  useEffect(() => {
    const fromUrl = parseWorkCategory(searchParams.get(WORK_CATEGORY_QUERY));
    if (fromUrl && populated.some((tab) => tab.key === fromUrl)) {
      setActive(fromUrl);
    }
  }, [searchParams, populated]);

  function selectTab(key: CaseStudy["category"]) {
    setActive(key);
    if (mode === "full" && pathname === "/work") {
      const params = new URLSearchParams(searchParams.toString());
      params.set(WORK_CATEGORY_QUERY, key);
      const query = params.toString();
      router.replace(query ? `/work?${query}` : "/work", { scroll: false });
    }
  }

  const current =
    populated.find((tab) => tab.key === active) ?? populated[0] ?? null;

  if (!current) {
    return null;
  }

  return (
    <div className="mt-12">
      <div
        className="flex flex-wrap gap-2 pb-2"
        role="tablist"
        aria-label="Project categories"
      >
        {populated.map((tab) => {
          const selected = tab.key === current.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`work-tab-${tab.key}`}
              aria-controls={`work-panel-${tab.key}`}
              className={
                selected
                  ? "btn-primary !py-2 text-sm"
                  : "btn-ghost !py-2 text-sm"
              }
              onClick={() => selectTab(tab.key)}
            >
              {tab.label}
              <span className="ml-1.5 text-xs font-medium opacity-80">
                ({tab.totalCount})
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`work-panel-${current.key}`}
        aria-labelledby={`work-tab-${current.key}`}
        className="mt-3"
      >
        {current.panelEyebrow ? (
          <p className="mb-2 font-[family-name:var(--font-body)] text-xs font-medium text-muted">
            {current.panelEyebrow}
          </p>
        ) : null}
        <ul className="divide-y divide-line border-y border-line">
          {current.studies.map((study) => (
            <CaseStudyListItem key={study.id} study={study} />
          ))}
        </ul>
        {mode === "home" && current.totalCount > current.studies.length ? (
          <div className="mt-2 pt-4">
            <Link
              href={`/work?${WORK_CATEGORY_QUERY}=${current.key}`}
              className="btn-ghost text-sm"
            >
              View more
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}