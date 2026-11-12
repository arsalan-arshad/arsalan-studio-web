export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

/**
 * Honest FAQs that mirror on-page studio copy (how it works, offers, brand history).
 * Keep answers aligned with public site claims — no invented metrics.
 */
export const studioFaqs: FaqItem[] = [
  {
    id: "who",
    question: "Who builds the work?",
    answer:
      "Arsalan Arshad — a sole-builder independent studio. You inquire and collaborate directly with him, not a staffing funnel.",
  },
  {
    id: "what",
    question: "What kinds of projects do you take?",
    answer:
      "Shopify apps, Salesforce packages and bridges, React Native / mobile and web products, AI automation, and retainer-style daily collaboration. Browse offers and case studies for concrete examples.",
  },
  {
    id: "how",
    question: "How does engagement start?",
    answer:
      "Browse offers and work on the site, send a marketplace brief via the public contact form (no account required), then continue with daily chat after signup for files, briefs, and status.",
  },
  {
    id: "remote",
    question: "Do you work remotely with clients abroad?",
    answer:
      "Yes. The studio is remote-friendly and serves clients worldwide. Freelance delivery for global clients has run through Fiverr, Upwork, and Toptal alongside productized studio work.",
  },
  {
    id: "clutch",
    question: "Where are Clutch reviews?",
    answer:
      "Verified client reviews live on Clutch under Arsalan Arshad (clutch.co/profile/arsalan-arshad). Digitize Turf was an earlier personal brand name for the same sole builder — craft from that chapter carries forward at arsalandev.studio.",
  },
  {
    id: "digitize-turf",
    question: "What is Digitize Turf?",
    answer:
      "Digitize Turf was Arsalan’s earlier personal brand — something he built for himself, not an agency. Mobile and web craft from that chapter carries forward; the studio brand and Clutch profile today are under Arsalan Arshad at arsalandev.studio.",
  },
  {
    id: "opensource",
    question: "Are the products open source?",
    answer:
      "Many Shopify, Salesforce, and AI case studies link to public GitHub repos (often MIT). Each case study page states license and contribution notes honestly.",
  },
];
