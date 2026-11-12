import type { CaseStudyDetail } from "@/data/caseStudyDetails";
import type { FaqItem } from "@/data/faqs";
import { presenceLinks } from "@/data/links";
import { brand } from "@/lib/brand";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${brand.domain}`;

export function getSiteUrl() {
  return siteUrl.replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Brand mark used for default social previews (existing asset; square). */
export function defaultOgImage() {
  const base = getSiteUrl();
  return {
    url: `${base}/icon-512.png`,
    width: 512,
    height: 512,
    alt: `${brand.name} Studio mark — independent software studio at ${brand.domain}`,
  };
}

function sameAsLinks() {
  return presenceLinks
    .filter(
      (l) =>
        l.group === "social" ||
        l.group === "marketplace" ||
        l.group === "studio",
    )
    .map((l) => l.href);
}

/** Person + Organization + WebSite + ProfessionalService JSON-LD graph. */
export function buildStudioJsonLd() {
  const base = getSiteUrl();
  const sameAs = sameAsLinks();

  const person = {
    "@type": "Person",
    "@id": `${base}/#person`,
    name: brand.name,
    url: base,
    email: brand.email,
    jobTitle: "Independent software studio builder",
    description:
      "Senior full-stack engineer and sole builder — React Native / mobile, web, Shopify, Salesforce, and AI automation. Remote-friendly studio marketplace for global clients; verified reviews on Clutch under Arsalan Arshad.",
    knowsAbout: [
      "React Native",
      "Shopify apps",
      "Salesforce packages",
      "Next.js",
      "Node.js",
      "CI/CD",
      "Fastlane",
      "AI automation",
      "AWS",
      "Azure",
      "Firebase",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Karachi",
      addressCountry: "PK",
    },
    sameAs,
    worksFor: { "@id": `${base}/#organization` },
  };

  const organization = {
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: `${brand.name} Studio`,
    url: base,
    email: brand.email,
    description:
      "Independent sole-builder studio marketplace for Shopify, Salesforce, React Native mobile, web, and AI automation — inquire and collaborate directly with Arsalan Arshad.",
    founder: { "@id": `${base}/#person` },
    logo: {
      "@type": "ImageObject",
      url: `${base}/icon-512.png`,
      width: 512,
      height: 512,
    },
    image: `${base}/icon-512.png`,
    sameAs,
    areaServed: "Worldwide",
  };

  const pastBrand = {
    "@type": "Organization",
    "@id": `${base}/#digitize-turf`,
    name: brand.pastBrand.name,
    description:
      "Earlier personal brand/vehicle built by Arsalan Arshad for client mobile and web work. Studio brand and Clutch profile today are under Arsalan Arshad.",
    founder: { "@id": `${base}/#person` },
  };

  const professionalService = {
    "@type": "ProfessionalService",
    "@id": `${base}/#service`,
    name: `${brand.name} Studio`,
    url: base,
    description:
      "Productized software delivery: Shopify apps, Salesforce packages, mobile (React Native) and web products, retainers, and AI automation — sole builder with daily collaboration.",
    provider: { "@id": `${base}/#person` },
    brand: { "@id": `${base}/#organization` },
    areaServed: "Worldwide",
    serviceType: [
      "Shopify app development",
      "Salesforce package development",
      "React Native mobile development",
      "Web application development",
      "AI automation",
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: `${brand.name} — Studio marketplace`,
    description: brand.tagline,
    publisher: { "@id": `${base}/#organization` },
    inLanguage: "en-US",
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${base}/#webpage`,
    url: base,
    name: `${brand.name} — Studio marketplace`,
    description:
      "Polite, conversion-led marketplace for Shopify, Salesforce, mobile, web, AI automation, and daily collaboration with Arsalan Arshad.",
    isPartOf: { "@id": `${base}/#website` },
    about: { "@id": `${base}/#person` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${base}/icon-512.png`,
    },
    inLanguage: "en-US",
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      person,
      organization,
      pastBrand,
      professionalService,
      website,
      webPage,
    ],
  };
}

function applicationCategory(study: CaseStudyDetail): string {
  switch (study.category) {
    case "shopify":
      return "BusinessApplication";
    case "salesforce":
      return "BusinessApplication";
    case "ai":
      return "DeveloperApplication";
    default:
      return "WebApplication";
  }
}

/** Per case-study SoftwareApplication + CreativeWork JSON-LD. */
export function buildCaseStudyJsonLd(study: CaseStudyDetail) {
  const base = getSiteUrl();
  const pageUrl = absoluteUrl(`/work/${study.id}`);
  const image = study.bannerSrc
    ? absoluteUrl(study.bannerSrc)
    : study.iconSrc
      ? absoluteUrl(study.iconSrc)
      : `${base}/icon-512.png`;

  const software: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `${pageUrl}#software`,
    name: study.title,
    description: study.summary,
    url: pageUrl,
    applicationCategory: applicationCategory(study),
    operatingSystem: "Web",
    author: { "@id": `${base}/#person` },
    creator: { "@id": `${base}/#person` },
    publisher: { "@id": `${base}/#organization` },
    image,
    keywords: study.stack.join(", "),
  };

  if (study.githubHref) {
    software.codeRepository = study.githubHref;
  }
  if (study.liveHref) {
    software.downloadUrl = study.liveHref;
    software.installUrl = study.liveHref;
  }

  const creativeWork: Record<string, unknown> = {
    "@type": "CreativeWork",
    "@id": `${pageUrl}#creativework`,
    name: study.title,
    headline: study.title,
    description: study.summary,
    url: pageUrl,
    author: { "@id": `${base}/#person` },
    creator: { "@id": `${base}/#person` },
    image,
    about: study.problem,
    creativeWorkStatus:
      study.status === "live" || study.status === "released"
        ? "Published"
        : study.status === "coming-soon" || study.status === "pending-shopify"
          ? "Incomplete"
          : "Published",
  };

  if (study.githubHref) {
    creativeWork.isBasedOn = study.githubHref;
  }

  const webPage = {
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: `${study.title} · Case study`,
    description: study.summary,
    isPartOf: { "@id": `${base}/#website` },
    about: { "@id": `${pageUrl}#software` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: image,
    },
    inLanguage: "en-US",
  };

  return {
    "@context": "https://schema.org",
    "@graph": [webPage, software, creativeWork],
  };
}

/** FAQPage JSON-LD — only pair with real on-page FAQ content. */
export function buildFaqJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
