export type CaseStudyStatus =
  | "live"
  | "released"
  | "completed"
  | "pending-shopify"
  | "coming-soon";

export type CaseStudy = {
  id: string;
  title: string;
  category: "ai" | "shopify" | "salesforce" | "other";
  status: CaseStudyStatus;
  blurb: string;
  /**
   * Manual pin within a category (lower = earlier).
   * When set, overrides status-based ranking so featured/coming-soon
   * items can sit near the top of a section.
   */
  listOrder?: number;
  /** App Store / hosted product / primary live URL */
  liveHref?: string;
  liveLabel?: string;
  /** Published npm package page */
  npmHref?: string;
  githubHref?: string;
  /** Path to hosted interactive demo (public/) */
  demoHref?: string;
  demoLabel?: string;
  /** Product walkthrough / launch video */
  youtubeHref?: string;
  youtubeLabel?: string;
  iconSrc?: string;
  bannerSrc?: string;
};

export const caseStudies: CaseStudy[] = [
  // AI — listed first on home / work
  {
    id: "pathwise",
    title: "Pathwise",
    category: "ai",
    status: "released",
    blurb:
      "Query planner for RAG and agent pipelines — declare your quality SLA; Pathwise picks the cheapest plan per request. Open-source TypeScript SDK.",
    githubHref: "https://github.com/arsalan-arshad/pathwise",
    npmHref: "https://www.npmjs.com/package/@arsalandev/pathwise",
    iconSrc: "/brands/ai/pathwise/icon.png",
    bannerSrc: "/brands/ai/pathwise/banner.png",
  },
  // Shopify — listOrder keeps Protocols #2 after the live forecast app
  {
    id: "ai-forecast-agent",
    title: "AI Forecast Agent",
    category: "shopify",
    status: "live",
    listOrder: 1,
    blurb:
      "Deterministic inventory math + grounded AI co-pilot. Live on the Shopify App Store. BYOK Gemini/Claude.",
    liveHref: "https://apps.shopify.com/ai-forecast-agent",
    liveLabel: "Live",
    githubHref: "https://github.com/arsalan-arshad/Ai-Agent-Shopify-App",
    iconSrc: "/brands/shopify/ai-forecast-agent/icon.png",
    bannerSrc: "/brands/shopify/ai-forecast-agent/banner.png",
    youtubeHref: "https://www.youtube.com/watch?v=-QAu-qkicjQ",
  },
  {
    id: "practitioner-protocols",
    title: "Practitioner Protocols",
    category: "shopify",
    status: "released",
    listOrder: 2,
    blurb:
      "Professionals share product protocols by link/QR with one-tap add-to-cart and attribution.",
    githubHref: "https://github.com/arsalan-arshad/practitioner-protocols",
    demoHref: "https://practitioner.arsalandev.studio/demo",
    demoLabel: "Demo",
    liveHref: "https://practitioner.arsalandev.studio/",
    liveLabel: "Live",
    youtubeHref: "https://www.youtube.com/watch?v=m0nlmLj-RKE",
    iconSrc: "/brands/shopify/practitioner-protocols/icon.png",
    bannerSrc: "/brands/shopify/practitioner-protocols/banner.png",
  },
  {
    id: "pipeline-aware-forecast",
    title: "Pipeline-Aware Forecast",
    category: "shopify",
    status: "pending-shopify",
    blurb:
      "Salesforce pipeline becomes forward demand in Shopify forecasting — the connective tissue most stacks skip. Pending Shopify review / App Store listing.",
    githubHref: "https://github.com/arsalan-arshad/pipeline-aware-forecast",
    youtubeHref: "https://www.youtube.com/watch?v=DpOLWprYx7g",
    iconSrc: "/brands/shopify/pipeline-aware-forecast/icon.png",
    bannerSrc: "/brands/shopify/pipeline-aware-forecast/banner.png",
  },
  {
    id: "bridge-core-recipes",
    title: "Bridge Core Recipes",
    category: "shopify",
    status: "pending-shopify",
    blurb:
      "Small shared core + narrow Shopify → Salesforce recipes instead of a bloated horizontal sync. Pending Shopify review / App Store listing.",
    githubHref: "https://github.com/arsalan-arshad/bridge-recipes",
    youtubeHref: "https://www.youtube.com/watch?v=vGMt_7cxuKg",
    iconSrc: "/brands/shopify/bridge-core-recipes/icon.png",
    bannerSrc: "/brands/shopify/bridge-core-recipes/banner.png",
  },
  {
    id: "inventory-mcp",
    title: "Inventory MCP Server",
    category: "shopify",
    status: "released",
    blurb:
      "Open-source MCP (v0.2.3): deterministic inventory forecasts for any AI assistant — local stdio or hosted Streamable HTTP. BYOK Shopify headers; numbers the model can explain, not invent.",
    githubHref: "https://github.com/arsalan-arshad/shopify-inventory-mcp",
    liveHref: "https://shopify-mcp.arsalandev.studio/",
    liveLabel: "Live",
    iconSrc: "/brands/shopify/inventory-mcp/icon.svg",
    bannerSrc: "/brands/shopify/inventory-mcp/banner.svg",
  },
  // Salesforce — full suite
  {
    id: "smart-record-cloner",
    title: "Smart Record Cloner",
    category: "salesforce",
    status: "released",
    blurb:
      "Deep clone utility with smart date shifting, child tagging, and Agentforce-ready invocable actions. AppExchange in review.",
    githubHref: "https://github.com/arsalan-arshad/smart-record-cloner",
    liveHref:
      "https://login.salesforce.com/packaging/installPackage.apexp?p0=04tg7000000V6E1AAK",
    liveLabel: "Install",
    demoHref: "/demos/salesforce/01-smart-record-cloner.html",
    demoLabel: "Demo",
    iconSrc: "/brands/salesforce/smart-record-cloner/icon.png",
    bannerSrc: "/brands/salesforce/smart-record-cloner/banner.jpg",
  },
  {
    id: "clean-flow-toast",
    title: "Clean Flow Toast & Alerts",
    category: "salesforce",
    status: "released",
    blurb:
      "Flow UI supercharger — Web Audio cues, confetti particles, sticky actionable toasts, platform events.",
    githubHref: "https://github.com/arsalan-arshad/clean-flow-toast-alerts",
    liveHref:
      "https://login.salesforce.com/packaging/installPackage.apexp?p0=04tg7000000WDVBAA4",
    liveLabel: "Install",
    demoHref: "/demos/salesforce/02-clean-flow-toast-alerts.html",
    demoLabel: "Demo",
    iconSrc: "/brands/salesforce/clean-flow-toast/icon.png",
    bannerSrc: "/brands/salesforce/clean-flow-toast/banner.jpg",
  },
  {
    id: "universal-quick-file",
    title: "Universal Quick File Viewer",
    category: "salesforce",
    status: "released",
    blurb:
      "Record-page LWC gallery, lightbox, bulk ZIP download, drag-and-drop upload, Agentforce summarizer.",
    githubHref: "https://github.com/arsalan-arshad/universal-quick-file-viewer",
    liveHref:
      "https://login.salesforce.com/packaging/installPackage.apexp?p0=04tg7000000WDi5AAG",
    liveLabel: "Install",
    demoHref: "/demos/salesforce/03-universal-quick-file-viewer.html",
    demoLabel: "Demo",
    iconSrc: "/brands/salesforce/universal-quick-file/icon.png",
    bannerSrc: "/brands/salesforce/universal-quick-file/banner.jpg",
  },
  {
    id: "shopify-sf-connector",
    title: "Shopify ↔ Salesforce Connector",
    category: "salesforce",
    status: "released",
    blurb:
      "Zero per-task fees. HMAC webhooks, DLQ retries, custom metadata mapping LWC in Setup.",
    githubHref: "https://github.com/arsalan-arshad/shopify-salesforce-connector",
    liveHref:
      "https://login.salesforce.com/packaging/installPackage.apexp?p0=04tg7000000XZWrAAO",
    liveLabel: "Install",
    demoHref: "/demos/salesforce/04-shopify-salesforce-connector.html",
    demoLabel: "Demo",
    iconSrc: "/brands/salesforce/shopify-sf-connector/icon.png",
    bannerSrc: "/brands/salesforce/shopify-sf-connector/banner.png",
  },
  {
    id: "shopify-ai-forecast-bridge",
    title: "Shopify AI Forecast Bridge",
    category: "salesforce",
    status: "released",
    blurb:
      "WMA stockout math in Salesforce + conversational inventory agent (BYOK) with opportunity stock checks.",
    githubHref: "https://github.com/arsalan-arshad/shopify-ai-forecast-bridge",
    liveHref:
      "https://login.salesforce.com/packaging/installPackage.apexp?p0=04tg7000000YxVVAA0",
    liveLabel: "Install",
    demoHref: "/demos/salesforce/05-shopify-ai-forecast-bridge.html",
    demoLabel: "Demo",
    iconSrc: "/brands/salesforce/shopify-ai-forecast-bridge/icon.png",
    bannerSrc: "/brands/salesforce/shopify-ai-forecast-bridge/banner.png",
  },
  // Libraries & web products (npm packages, hubs, scanners)
  {
    id: "urdu-business-nlu",
    title: "Urdu Business NLU",
    category: "other",
    status: "completed",
    blurb:
      "MIT TypeScript library: informal Urdu / Roman-Urdu business messages → validated structured records. Published on npm.",
    npmHref: "https://www.npmjs.com/package/urdu-business-nlu",
    githubHref: "https://github.com/arsalan-arshad/urdu-business-nlu",
    iconSrc: "/brands/other/urdu-business-nlu/icon.png",
    bannerSrc: "/brands/other/urdu-business-nlu/banner.png",
  },
  {
    id: "sme-automation",
    title: "SME Automation Services",
    category: "other",
    status: "coming-soon",
    blurb:
      "Fixed-scope WhatsApp / ERP / Shopify / Salesforce automation with open-source recipes and honest exclusions.",
    iconSrc: "/brands/other/sme-automation/icon.png",
    bannerSrc: "/brands/other/sme-automation/banner.png",
  },
  {
    id: "influencer-hub",
    title: "Influencer Hub",
    category: "other",
    status: "live",
    blurb:
      "Stockroom Studio hub for AI influencer characters (Nana Says, Pallet the Robot) — labeled as AI, not human creators.",
    liveHref: "https://influencer.arsalandev.studio/",
    liveLabel: "Live",
    githubHref: "https://github.com/arsalan-arshad/Influencer-hub",
    iconSrc: "/brands/other/influencer-hub/icon.png",
    bannerSrc: "/brands/other/influencer-hub/banner.png",
  },
  {
    id: "proposal-guard",
    title: "Proposal Guard",
    category: "other",
    status: "live",
    blurb:
      "Deterministic, offline scope-creep checker for proposals and SOWs — quotes the risky sentence, names the rule, suggests a fill-in-the-blanks fix. Not legal advice.",
    liveHref: "https://proposal-guard.arsalandev.studio/",
    liveLabel: "Live",
    npmHref: "https://www.npmjs.com/package/proposal-guard",
    githubHref: "https://github.com/arsalan-arshad/proposal-guard",
    iconSrc: "/brands/other/proposal-guard/icon.png",
    bannerSrc: "/brands/other/proposal-guard/banner.png",
  },
  {
    id: "eu-ai-act-checker",
    title: "EU AI Act Checker",
    category: "other",
    status: "coming-soon",
    blurb:
      "Open scanner for public-site AI Act transparency basics + paid audit report. Technical check, not legal advice.",
    githubHref: "https://github.com/arsalan-arshad/ai-act-check",
    iconSrc: "/brands/other/eu-ai-act-checker/icon.png",
    bannerSrc: "/brands/other/eu-ai-act-checker/banner.png",
  },
  {
    id: "freight-exceptions",
    title: "Freight Exceptions",
    category: "other",
    status: "coming-soon",
    blurb:
      "Deterministic exception rules for small brokers/3PLs — AI extracts and drafts; humans approve.",
    githubHref: "https://github.com/arsalan-arshad/freight-exceptions",
    iconSrc: "/brands/other/freight-exceptions/icon.png",
    bannerSrc: "/brands/other/freight-exceptions/banner.png",
  },
];

export const statusLabel: Record<CaseStudyStatus, string> = {
  live: "Live",
  released: "Released",
  completed: "Completed",
  "pending-shopify": "Pending Shopify",
  "coming-soon": "Coming soon",
};

/** Live → released/completed → pending Shopify → coming soon. */
const statusRank: Record<CaseStudyStatus, number> = {
  live: 0,
  released: 1,
  completed: 1,
  "pending-shopify": 2,
  "coming-soon": 3,
};

/** Status ranks sit above 100 so explicit listOrder pins stay first. */
const STATUS_SORT_BASE = 100;

export function sortCaseStudiesByStatus(studies: CaseStudy[]): CaseStudy[] {
  return [...studies].sort((a, b) => {
    const aKey = a.listOrder ?? STATUS_SORT_BASE + statusRank[a.status];
    const bKey = b.listOrder ?? STATUS_SORT_BASE + statusRank[b.status];
    return aKey - bKey;
  });
}

export function studiesByCategory(category: CaseStudy["category"]) {
  return sortCaseStudiesByStatus(
    caseStudies.filter((c) => c.category === category),
  );
}

export const categoryLabel: Record<CaseStudy["category"], string> = {
  ai: "AI",
  shopify: "Shopify",
  salesforce: "Salesforce",
  other: "Libraries & web products",
};
