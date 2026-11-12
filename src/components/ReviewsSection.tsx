import { reviewStats, reviews } from "@/data/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-accent" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} aria-hidden>
          {i < Math.round(rating) ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      className="section-pad scroll-mt-20 border-t border-line bg-bg-elevated/60"
    >
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Reviews</p>
        <h2 className="section-title mt-3">Clients on Clutch & Fiverr</h2>
        <p className="mt-4 max-w-2xl text-muted">
          Verified Clutch feedback on the{" "}
          <span className="text-ink">Arsalan Arshad</span> profile (5.0★ · 3
          reviews), plus the live Fiverr profile for marketplace reviews.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <a
            href={reviewStats.clutchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-lume inline-flex items-center gap-2 rounded-sm px-4 py-2 font-medium text-ink hover:border-accent"
          >
            Clutch {reviewStats.clutchAverage.toFixed(1)}★ · {reviewStats.clutchCount}{" "}
            reviews
          </a>
          <a
            href={reviewStats.fiverrHref}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-lume inline-flex items-center gap-2 rounded-sm px-4 py-2 font-medium text-ink hover:border-accent"
          >
            Fiverr profile →
          </a>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="panel-lume flex flex-col rounded-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={r.rating} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {r.source === "clutch" ? "Clutch" : "Fiverr"}
                  {r.verified ? " · Verified" : ""}
                </span>
              </div>
              <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink">
                “{r.quote}”
              </blockquote>
              <div className="mt-5 border-t border-line pt-4 text-sm">
                <p className="font-medium text-ink">
                  {r.author}
                  {r.company ? ` · ${r.company}` : ""}
                </p>
                {r.project ? (
                  <p className="mt-0.5 text-xs text-muted">{r.project}</p>
                ) : null}
                {r.note ? (
                  <p className="mt-1 text-xs text-muted">{r.note}</p>
                ) : null}
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
                >
                  Read on {r.source === "clutch" ? "Clutch" : "Fiverr"} →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
