import { AlsoLiveStrip } from "@/components/AlsoLiveStrip";
import { AppLaunchSection } from "@/components/AppLaunchSection";
import { CaseStudiesSection } from "@/components/CaseStudiesSection";
import { ContactForm } from "@/components/ContactForm";
import { FaqSection } from "@/components/FaqSection";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { OffersSection } from "@/components/OffersSection";
import { ProofLine } from "@/components/ProofLine";
import { ReviewsSection } from "@/components/ReviewsSection";
import { StudioStory } from "@/components/StudioStory";
import { TrustStrip } from "@/components/TrustStrip";
import { studioFaqs } from "@/data/faqs";
import { proofLines } from "@/data/proofLines";
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
      <ProofLine>{proofLines.afterCaseStudies}</ProofLine>
      <StudioStory />
      <AppLaunchSection />
      <ReviewsSection />
      <HowItWorks />
      <ProofLine>{proofLines.afterHowItWorks}</ProofLine>
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
          <div className="mt-8">
            <ProofLine compact>{proofLines.aboveContactForm}</ProofLine>
          </div>
          <div className="mt-6">
            <Suspense fallback={<p className="text-muted">Loading form…</p>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}