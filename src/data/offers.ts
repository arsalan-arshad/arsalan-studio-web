export type Offer = {
  id: string;
  name: string;
  forWho: string;
  includes: string[];
  startingPoint: string;
  cta: string;
  needParam: string;
};

/** Capability-led offers — what Arsalan builds for client work. */
export const offers: Offer[] = [
  {
    id: "shopify-app",
    name: "Shopify apps that make it to the App Store",
    forWho: "merchants and agencies who need a real embedded admin app.",
    includes: [
      "Inventory forecasting, storefront or admin extensions, custom flows",
      "Shipped apps through Shopify review, including my own live inventory app",
      "Deterministic numbers with an AI copilot that explains them instead of inventing them",
    ],
    startingPoint: "",
    cta: "Send your project brief",
    needParam: "shopify-app",
  },
  {
    id: "salesforce-package",
    name: "Salesforce packages and Shopify bridges",
    forWho:
      "teams that need 2GP utilities, LWC interfaces, or Shopify to Salesforce sync without per-task fees.",
    includes: [
      "HMAC webhooks, retry queues and mapping UI",
      "Test coverage and audit trail",
      "AppExchange-ready where it matters",
    ],
    startingPoint: "",
    cta: "Send your project brief",
    needParam: "salesforce",
  },
  {
    id: "mobile-web",
    name: "Mobile and web products",
    forWho:
      "founders who need React Native, Expo or Next.js talking to a real backend.",
    includes: [
      "Auth, messaging, files, briefs, status",
      "Store releases and CI from years of practice",
      "Plain-English progress daily",
    ],
    startingPoint: "",
    cta: "Send your project brief",
    needParam: "mobile-any",
  },
  {
    id: "retainer",
    name: "Ongoing engineering support",
    forWho:
      "teams that need an engineer on call for Shopify, Salesforce, AI or product iterations.",
    includes: [
      "A fixed number of hours a week",
      "A backlog you can see",
      "A weekly cadence instead of a hiring funnel",
    ],
    startingPoint: "",
    cta: "Send your project brief",
    needParam: "retainer",
  },
];