import { AlsoLiveStrip } from "@/components/AlsoLiveStrip";
import { AppLaunchSection } from "@/components/AppLaunchSection";
import { CaseStudiesSection } from "@/components/CaseStudiesSection";
import { ContactForm } from "@/components/ContactForm";
import { FaqSection } from "@/components/FaqSection";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { OffersSection } from "@/components/OffersSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { StudioStory } from "@/components/StudioStory";
import { TrustStrip } from "@/components/TrustStrip";
import { studioFaqs } from "@/data/faqs";
import { buildFaqJsonLd } from "@/lib/seo";
import { Suspense } from "react";

export default function HomePage() {
  const faqJsonLd = buildFaqJsonLd(studioFaqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <TrustStrip />
      <OffersSection />
      <AlsoLiveStrip />
      <CaseStudiesSection mode="home" />
      <StudioStory />
      <AppLaunchSection />
      <ReviewsSection />
      <HowItWorks />
      <FaqSection />
      <section
        id="contact"
        className="section-pad border-t border-line scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">Contact</p>
          <h2 className="section-title mt-3">Start the conversation</h2>
          <p className="mt-4 max-w-xl text-muted">
            Send a brief. No account needed. I reply within one working day.
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