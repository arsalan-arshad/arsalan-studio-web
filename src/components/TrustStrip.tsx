import { reviewStats } from "@/data/reviews";
import { brand } from "@/lib/brand";

export function TrustStrip() {
  return (
    <section
      aria-label="Client trust signals"
      className="border-y border-line bg-bg-elevated/80"
    >
      <div className="mx-auto max-w-6xl px-[clamp(1.25rem,4vw,3.5rem)] py-5">
        <p className="text-center text-sm text-ink/90 sm:text-left">
          <a
            href={brand.clutch}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:text-accent hover:underline"
          >
            {reviewStats.clutchAverage.toFixed(1)} on Clutch
          </a>
          <span className="text-muted"> · </span>
          <a
            href={reviewStats.fiverrHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-4 hover:text-accent hover:underline"
          >
            {reviewStats.fiverrAverage.toFixed(1)} across {reviewStats.fiverrReviewCount}{" "}
            Fiverr reviews
          </a>
          <span className="text-muted"> · </span>
          <span>$300K raised by a client whose app I shipped</span>
        </p>
      </div>
    </section>
  );
}