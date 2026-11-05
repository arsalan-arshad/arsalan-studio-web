import Link from "next/link";
import { offers } from "@/data/offers";

export function OffersSection() {
  return (
    <section id="offers" className="section-pad border-t border-line scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Offers</p>
        <h2 className="section-title mt-3 max-w-2xl">
          What I can try to bring for you
        </h2>
        <p className="mt-4 max-w-2xl text-muted">
          Capability-led packages — outcomes and craft, not a SKU menu. Fixed
          scope, written exclusions, acceptance tests. You work with me
          directly. Most product work is{" "}
          <span className="text-ink">open source (MIT)</span> and open for PRs
          when we publish recipes.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {offers.map((offer) => (
            <article key={offer.id} className="border-t border-line pt-6">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                {offer.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                <span className="text-accent">For: </span>
                {offer.forWho}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ink/90">
                {offer.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">{offer.startingPoint}</p>
              <Link
                href={`/contact?need=${offer.needParam}`}
                className="btn-primary mt-6 !inline-flex"
              >
                {offer.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
