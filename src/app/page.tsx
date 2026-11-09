import { CaseStudiesSection } from "@/components/CaseStudiesSection";
import { ContactForm } from "@/components/ContactForm";
import { ExperienceSection } from "@/components/ExperienceSection";
import { Hero } from "@/components/Hero";
import { HowIBuild } from "@/components/HowIBuild";
import { HowItWorks } from "@/components/HowItWorks";
import { OffersCtaStrip } from "@/components/OffersCtaStrip";
import { OffersSection } from "@/components/OffersSection";
import { OpenSourceNote } from "@/components/OpenSourceNote";
import { PresenceSection } from "@/components/PresenceSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { StudioStory } from "@/components/StudioStory";
import { TrustStrip } from "@/components/TrustStrip";
import Link from "next/link";
import { Suspense } from "react";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <StudioStory />
      <HowIBuild />
      <OffersSection />
      <OffersCtaStrip />
      <OpenSourceNote />
      {/* Full Salesforce suite; icons only on home (banners on /work/[slug]) */}
      <CaseStudiesSection ensureAllSalesforce />
      <ReviewsSection />
      <HowItWorks />
      <PresenceSection />
      <ExperienceSection />
      <section
        id="contact"
        className="section-pad border-t border-line scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Contact</p>
          <h2 className="section-title mt-3">Start the conversation</h2>
          <p className="mt-4 max-w-xl text-muted">
            Marketplace brief — no account required. For files, briefs, and
            ongoing status,{" "}
            <Link
              href="/signup"
              className="text-accent underline-offset-4 hover:underline"
            >
              sign up
            </Link>{" "}
            and continue in the mobile app.
          </p>
          <div className="mt-10">
            <Suspense fallback={<p className="text-muted">Loading form…</p>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
