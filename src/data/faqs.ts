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
      "Browse the offers, then send a brief through the public contact form. No account required. I reply within one working day and we keep one thread going from there.",
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
      "Verified client reviews live on Clutch under Arsalan Arshad (clutch.co/profile/arsalan-arshad).",
  },
  {
    id: "digitize-turf",
    question: "What is Digitize Turf?",
    answer:
      "Digitize Turf was my earlier personal brand. The studio and my Clutch reviews are now under Arsalan Arshad at arsalandev.studio.",
  },
  {
    id: "opensource",
    question: "Are the products open source?",
    answer:
      "Many Shopify, Salesforce, and AI case studies link to public GitHub repos (often MIT). Each case study page states license and contribution notes honestly.",
  },
];