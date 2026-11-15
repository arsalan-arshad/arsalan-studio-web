import { ExperienceTimeline } from "@/components/ExperienceSection";
import { experienceIntro, resumePdfHref } from "@/data/experience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job history",
  description: experienceIntro,
  alternates: {
    canonical: "/job-history",
  },
  openGraph: {
    url: "/job-history",
    title: "Job history · Jobs & worker history",
    description: experienceIntro,
  },
};

export default function JobHistoryPage() {
  return (
    <div className="pt-14">
      <div className="section-pad">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Experience</p>
          <h1 className="section-title mt-3">Jobs & worker history</h1>
          <p className="mt-4 max-w-2xl text-muted">{experienceIntro}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={resumePdfHref}
              download
              className="btn-primary !inline-flex"
            >
              Download resume
            </a>
            <a
              href={resumePdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-sm"
            >
              Open PDF in new tab
            </a>
          </div>

          <div className="mt-14 border-t border-line pt-14">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-ink">
              Roles from the resume
            </h2>
            <ExperienceTimeline />
          </div>
        </div>
      </div>
    </div>
  );
}