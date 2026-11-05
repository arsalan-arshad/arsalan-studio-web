import Link from "next/link";

export function OffersCtaStrip() {
  return (
    <section className="border-y border-line bg-[linear-gradient(105deg,var(--accent-wash),transparent_55%)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-[clamp(1.25rem,4vw,3.5rem)] py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Clear packages</p>
          <p className="mt-2 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-ink">
            Tell me what you need shipped — I can try to bring Shopify, Salesforce, mobile/web, or daily collaboration.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/#offers" className="btn-primary">
            View offers
          </Link>
          <Link href="/contact" className="btn-ghost">
            Start conversation
          </Link>
        </div>
      </div>
    </section>
  );
}
