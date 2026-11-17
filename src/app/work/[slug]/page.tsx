import { CaseStudyVisual } from "@/components/CaseStudyVisual";
import {
  allCaseStudyIds,
  getCaseStudyDetail,
  statusLabelLong,
} from "@/data/caseStudyDetails";
import { categoryLabel, statusLabel } from "@/data/caseStudies";
import { InstallGuideUrl, linkifyText } from "@/lib/linkify";
import { absoluteUrl, buildCaseStudyJsonLd, defaultOgImage } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allCaseStudyIds().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudyDetail(slug);
  if (!study) return { title: "Case study" };

  const canonical = `/work/${study.id}`;
  const fallback = defaultOgImage();
  const imageUrl = study.bannerSrc ?? study.iconSrc ?? fallback.url;
  const imageAlt = study.bannerSrc
    ? `${study.title} — case study banner`
    : study.iconSrc
      ? `${study.title} icon`
      : fallback.alt;

  return {
    title: study.title,
    description: study.summary,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(canonical),
      title: `${study.title} · Case study`,
      description: study.summary,
      images: [
        {
          url: imageUrl,
          alt: imageAlt,
          ...(!study.bannerSrc && !study.iconSrc
            ? { width: fallback.width, height: fallback.height }
            : {}),
        },
      ],
    },
    twitter: {
      card: study.bannerSrc ? "summary_large_image" : "summary",
      title: `${study.title} · Case study`,
      description: study.summary,
      images: {
        url: imageUrl,
        alt: imageAlt,
      },
    },
  };
}

export default function CaseStudyPage({ params }: Props) {
  return (
    <Suspense fallback={<CaseStudyPageFallback />}>
      <CaseStudyArticle params={params} />
    </Suspense>
  );
}

function CaseStudyPageFallback() {
  return (
    <article className="section-pad pt-20" aria-busy="true">
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="h-4 w-32 rounded bg-bg-elevated" />
        <div className="mt-6 flex gap-4">
          <div className="h-16 w-16 shrink-0 rounded-md bg-bg-elevated" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-20 rounded bg-bg-elevated" />
            <div className="h-8 w-3/4 max-w-md rounded bg-bg-elevated" />
            <div className="h-4 w-full rounded bg-bg-elevated" />
          </div>
        </div>
        <p className="mt-8 text-sm text-muted">Loading case study…</p>
      </div>
    </article>
  );
}

async function CaseStudyArticle({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudyDetail(slug);
  if (!study) notFound();

  const jsonLd = buildCaseStudyJsonLd(study);

  return (
    <article className="section-pad pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-muted">
          <Link href="/work" className="hover:text-ink">
            Work
          </Link>
          <span className="mx-2">/</span>
          <span>{categoryLabel[study.category]}</span>
        </p>

        <div className="mt-6 flex flex-wrap items-start gap-4">
          <CaseStudyVisual study={study} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{statusLabel[study.status]}</p>
            <h1 className="section-title mt-2">{study.title}</h1>
            <p className="mt-3 text-muted">{study.summary}</p>
          </div>
        </div>

        {study.bannerSrc ? (
          <div className="mt-8 w-full overflow-hidden rounded-md border border-line bg-bg-elevated">
            <CaseStudyVisual study={study} banner fit="contain" />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {study.githubHref ? (
            <a
              href={study.githubHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !px-3 !py-2 text-sm"
            >
              GitHub
            </a>
          ) : null}
          {study.liveHref ? (
            <a
              href={study.liveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !px-3 !py-2 text-sm"
            >
              {study.liveLabel ?? "Live"}
            </a>
          ) : null}
          {study.npmHref ? (
            <a
              href={study.npmHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !px-3 !py-2 text-sm"
            >
              npm
            </a>
          ) : null}
          {study.demoHref ? (
            <a
              href={study.demoHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !px-3 !py-2 text-sm"
            >
              {study.demoLabel ?? "Demo"}
            </a>
          ) : null}
          {study.youtubeHref ? (
            <a
              href={study.youtubeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !px-3 !py-2 text-sm"
            >
              {study.youtubeLabel ?? "YouTube"}
            </a>
          ) : null}
        </div>

        {study.installGuide ? (
          <div className="mt-4 max-w-2xl rounded-sm border border-line bg-bg-elevated/80 px-4 py-3 text-sm leading-relaxed text-muted">
            <p className="font-semibold text-ink">{study.installGuide.title}</p>
            <p className="mt-1">{study.installGuide.body}</p>
            <InstallGuideUrl url={study.installGuide.urlExample} />
          </div>
        ) : null}

        <Section title="What it does">
          <p>{study.summary}</p>
        </Section>

        <Section title="Problem → Solution">
          <p className="font-medium text-ink">Problem</p>
          <p className="mt-1">{study.problem}</p>
          <p className="mt-4 font-medium text-ink">Solution</p>
          <p className="mt-1">{study.solution}</p>
        </Section>

        <Section title="Who it’s for">
          <p>{study.audience}</p>
        </Section>

        <Section title="Usage">
          <ol className="list-decimal space-y-2 pl-5">
            {study.usage.map((step) => (
              <li key={step}>{linkifyText(step)}</li>
            ))}
          </ol>
        </Section>

        <Section title="Stack">
          <ul className="flex flex-wrap gap-2">
            {study.stack.map((item) => (
              <li
                key={item}
                className="border border-line bg-bg-elevated px-3 py-1.5 text-sm text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Architecture highlights">
          <ul className="space-y-2">
            {study.architecture.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Key features">
          <ul className="space-y-2">
            {study.features.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        {study.results?.map((block) => (
          <Section key={block.title} title={block.title}>
            {block.intro ? <p>{block.intro}</p> : null}
            <div className="mt-4 -mx-1 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    {block.columns.map((col) => (
                      <th
                        key={col}
                        className="whitespace-nowrap px-3 py-2 font-medium text-ink"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row.join("|")} className="border-b border-line/70">
                      {row.map((cell, i) => (
                        <td
                          key={`${row[0]}-${block.columns[i]}`}
                          className="px-3 py-2 align-top text-muted"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {block.bullets?.length ? (
              <ul className="mt-4 space-y-2">
                {block.bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {block.footnote ? (
              <p className="mt-3 text-sm text-muted">{block.footnote}</p>
            ) : null}
            {block.link ? (
              <p className="mt-3">
                <a
                  href={block.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent underline-offset-4 hover:underline"
                >
                  {block.link.label} →
                </a>
              </p>
            ) : null}
          </Section>
        ))}

        <Section title="Status">
          <p>{statusLabelLong(study.status)}</p>
          {study.buildingNote ? (
            <p className="mt-2 text-sm text-muted">{study.buildingNote}</p>
          ) : null}
        </Section>

        <Section title="Open source">
          <p>
            <span className="font-medium text-ink">{study.openSource.license}.</span>{" "}
            {study.openSource.note}
          </p>
          {study.githubHref ? (
            <p className="mt-3">
              <a
                href={study.githubHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Open pull requests on GitHub →
              </a>
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Repository link forthcoming — contributions will be invited when
              the repo is public.
            </p>
          )}
        </Section>

        <div className="mt-12 border-t border-line pt-8">
          <p className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
            Want something like this built for you?
          </p>
          <p className="mt-2 text-sm text-muted">
            Start a conversation — sole builder, daily progress, fixed-scope offers.
          </p>
          <Link href="/contact" className="btn-primary mt-5 !inline-flex">
            Start conversation
          </Link>
        </div>
      </div>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}
