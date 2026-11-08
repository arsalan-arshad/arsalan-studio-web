import { brand } from "@/lib/brand";
import { presenceLinks } from "@/data/links";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${brand.domain}`;

export function getSiteUrl() {
  return siteUrl.replace(/\/$/, "");
}

/** Person + Organization JSON-LD for the studio marketplace. */
export function buildStudioJsonLd() {
  const base = getSiteUrl();
  const sameAs = presenceLinks
    .filter((l) => l.group === "social" || l.group === "marketplace")
    .map((l) => l.href);

  const person = {
    "@type": "Person",
    "@id": `${base}/#person`,
    name: brand.name,
    url: base,
    email: brand.email,
    jobTitle: "Independent software studio builder",
    description: brand.tagline,
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
      "Sole-builder studio marketplace for Shopify, Salesforce, mobile, web, and AI automation.",
    founder: { "@id": `${base}/#person` },
    logo: `${base}/icon-512.png`,
    sameAs,
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

  return {
    "@context": "https://schema.org",
    "@graph": [person, organization, website],
  };
}
