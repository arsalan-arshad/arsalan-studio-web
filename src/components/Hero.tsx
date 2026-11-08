import Link from "next/link";
import { brand } from "@/lib/brand";

export function Hero() {
  return (
    <section className="hero-atmosphere relative flex flex-col justify-start pb-12 pt-[4.25rem] sm:pb-14 sm:pt-[4.5rem]">
      <div
        aria-hidden
        className="motion-drift pointer-events-none absolute inset-0 -z-0"
      >
        <div className="absolute right-[-6%] top-[6%] h-[32vmin] w-[32vmin] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]" />
        <div className="absolute bottom-[10%] left-[-8%] h-[26vmin] w-[26vmin] rounded-full bg-[radial-gradient(circle,rgba(126,159,144,0.16),transparent_70%)]" />
        <div className="absolute left-[42%] top-[38%] h-[18vmin] w-[18vmin] rounded-full bg-[radial-gradient(circle,rgba(90,110,145,0.2),transparent_70%)]" />
      </div>

      <div className="relative z-[2] mx-auto w-full max-w-6xl px-[clamp(1.25rem,4vw,3.5rem)] pt-6 sm:pt-8">
        <p className="eyebrow motion-rise">Marketplace · Sole builder</p>
        <h1 className="motion-rise-delay-1 mt-3 font-[family-name:var(--font-display)] text-[clamp(2.4rem,7vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-ink">
          {brand.name}
        </h1>
        <p className="motion-rise-delay-2 mt-4 max-w-xl text-base text-muted sm:text-lg">
          {brand.tagline} Shopify, Salesforce, mobile, web, and automation —
          inquire here, keep the thread alive on the app.
        </p>
        <div className="motion-rise-delay-3 mt-7 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">
            Get started
          </Link>
          <Link href="/#offers" className="btn-ghost">
            See offers
          </Link>
          <Link href="/work/salesforce-demo" className="btn-ghost">
            Try Salesforce demo
          </Link>
        </div>
        <div
          className="motion-pulse mt-8 h-px w-24 bg-gradient-to-r from-accent via-accent/50 to-transparent"
          aria-hidden
        />
      </div>
    </section>
  );
}
