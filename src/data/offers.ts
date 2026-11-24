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
    id: "agent-safety",
    name: "Approvals and audit trails for production AI agents",
    forWho:
      "teams shipping AI agents that write to real systems (APIs, databases, customer data) and need a human approval step, a record of what ran, and a way to undo it.",
    includes: [
      "Approval step before risky actions: the pending action and its arguments are shown to a reviewer first",
      "Tamper-evident audit log of every action (hash-chained, exportable)",
      "Built on open standards (MCP) and open-source building blocks, no lock-in",
      "Fixed scope, written exclusions, acceptance tests (same as my other work)",
    ],
    startingPoint: "",
    cta: "Send your project brief",
    needParam: "agent-safety",
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
  
  
  
];