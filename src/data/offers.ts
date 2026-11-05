export type Offer = {
  id: string;
  name: string;
  forWho: string;
  includes: string[];
  startingPoint: string;
  cta: string;
  needParam: string;
};

/**
 * Capability-led offers — what Arsalan can bring, not just product SKUs.
 */
export const offers: Offer[] = [
  {
    id: "shopify-app",
    name: "I can bring a Shopify app to life",
    forWho:
      "Merchants and partners who need a real embedded Admin experience — forecasting, inventory, protocols, or a custom extension — not another GPT wrapper.",
    includes: [
      "I can try to bring deterministic cores where numbers must be auditable",
      "BYOK AI that explains snapshots — never invents stock figures",
      "App Store or self-host path; Railway-ready deploy patterns I’ve shipped",
      "Open-source-friendly handoff when you want MIT recipes",
      "Written exclusions + acceptance tests before code",
    ],
    startingPoint:
      "Send a problem brief or point at an existing open-source blueprint — we’ll scope what I can actually ship.",
    cta: "Start conversation",
    needParam: "shopify-app",
  },
  {
    id: "salesforce-package",
    name: "I can ship Salesforce packages & bridges",
    forWho:
      "Teams that need a 2GP utility, LWC UX, or Shopify ↔ Salesforce signals without per-task sync fees.",
    includes: [
      "I can try to bring LWC + Apex with strong test coverage and unlocked 2GP",
      "HMAC-safe webhooks, mapping UI, DLQ-minded integrations",
      "Interactive demos stakeholders can click before install",
      "AppExchange readiness dossier when listing matters",
      "Same sole builder from spike to package promote",
    ],
    startingPoint:
      "Tell me the object / Flow / commerce signal — I’ll propose a fixed slice.",
    cta: "Start conversation",
    needParam: "salesforce",
  },
  {
    id: "mobile-web",
    name: "I can deliver mobile & web products",
    forWho:
      "Founders who need Expo/RN or Next.js surfaces talking to a real API — messaging, briefs, status — not throwaways.",
    includes: [
      "I can try to bring Expo TypeScript clients and Next.js App Router shells",
      "Auth-gated messaging patterns (files, briefs, status) on a shared API",
      "Store-prep / CI habits from years of App Store & Play releases",
      "Cloud on AWS, GCP, Azure, or Firebase when the product needs it",
      "Daily progress chat while we build",
    ],
    startingPoint:
      "Name the first three screens or routes that matter — we ship those first.",
    cta: "Start conversation",
    needParam: "mobile-any",
  },
  {
    id: "retainer",
    name: "I can stay on as daily collaboration",
    forWho:
      "Operators who want a sole engineer for Shopify, Salesforce, AI/automation, or product iterations — weekly cadence, not a hiring funnel.",
    includes: [
      "I can try to bring agreed hours + a living backlog you can see",
      "Daily check-ins via the studio messaging app",
      "Fixed-scope slices with acceptance tests",
      "AI/automation and SME-style recipes where they fit (honest exclusions)",
      "Open-source leftovers published with client details removed",
    ],
    startingPoint:
      "Book discovery; we lock scope and cadence before any code.",
    cta: "Start conversation",
    needParam: "retainer",
  },
];
