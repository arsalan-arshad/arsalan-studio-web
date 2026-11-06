export type CaseStudyStatus =
  | "live"
  | "released"
  | "completed"
  | "pending-shopify"
  | "coming-soon";

export type CaseStudy = {
  id: string;
  title: string;
  category: "shopify" | "salesforce" | "other";
  status: CaseStudyStatus;
  blurb: string;
  /** App Store / npm / package install / hosted product */
  liveHref?: string;
  liveLabel?: string;
  githubHref?: string;
  /** Path to hosted interactive demo (public/) */
  demoHref?: string;
  demoLabel?: string;
  iconSrc?: string;
  bannerSrc?: string;
};

export const caseStudies: CaseStudy[] = [
  // Shopify
  {
    id: "ai-forecast-agent",
    title: "AI Forecast Agent",
    category: "shopify",
    status: "live",
    blurb:
      "Deterministic inventory math + grounded AI co-pilot. Live on the Shopify App Store. BYOK Gemini/Claude.",
    liveHref: "https://apps.shopify.com/ai-forecast-agent",
    liveLabel: "Live",
    githubHref: "https://github.com/arsalan-arshad/Ai-Agent-Shopify-App",
    iconSrc: "/brands/shopify/ai-forecast-agent/icon.png",
    bannerSrc: "/brands/shopify/ai-forecast-agent/banner.png",
  },
  {
    id: "pipeline-aware-forecast",
    title: "Pipeline-Aware Forecast",
    category: "shopify",
    status: "pending-shopify",
    blurb:
      "Salesforce pipeline becomes forward demand in Shopify forecasting — the connective tissue most stacks skip. Pending Shopify review / App Store listing.",
    githubHref: "https://github.com/arsalan-arshad/pipeline-aware-forecast",
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
    iconSrc: "/brands/shopify/bridge-core-recipes/icon.png",
    bannerSrc: "/brands/shopify/bridge-core-recipes/banner.png",
  },
  {
    id: "practitioner-protocols",
    title: "Practitioner Protocols",
    category: "shopify",
    status: "coming-soon",
    blurb:
      "Professionals share product protocols by link/QR with one-tap add-to-cart and attribution.",
    githubHref: "https://github.com/arsalan-arshad/practitioner-protocols",
    iconSrc: "/brands/shopify/practitioner-protocols/icon.png",
    bannerSrc: "/brands/shopify/practitioner-protocols/banner.png",
  },
  {
    id: "inventory-mcp",
    title: "Inventory MCP Server",
    category: "shopify",
    status: "released",
    blurb:
      "Open-source MCP (v0.2.3): deterministic inventory forecasts for any AI assistant — local stdio or hosted Streamable HTTP. BYOK Shopify headers; numbers the model can explain, not invent.",
    githubHref: "https://github.com/arsalan-arshad/shopify-inventory-mcp",
    liveHref: "https://shopify-inventory-mcp-production-e5fd.up.railway.app/",
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
  // Other
  {
    id: "urdu-business-nlu",
    title: "Urdu Business NLU",
    category: "other",
    status: "completed",
    blurb:
      "MIT TypeScript library: informal Urdu / Roman-Urdu business messages → validated structured records. Published on npm.",
    liveHref: "https://www.npmjs.com/package/urdu-business-nlu",
    liveLabel: "Live",
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
    id: "eu-ai-act-checker",
    title: "EU AI Act Checker",
    category: "other",
    status: "coming-soon",
    blurb:
      "Open scanner for public-site AI Act transparency basics + paid audit report. Technical check, not legal advice.",
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
    iconSrc: "/brands/other/freight-exceptions/icon.png",
    bannerSrc: "/brands/other/freight-exceptions/banner.png",
  },
  {
    id: "influencer-hub",
    title: "Influencer Hub",
    category: "other",
    status: "live",
    blurb:
      "Stockroom Studio hub for AI influencer characters (Nana Says, Pallet the Robot) — labeled as AI, not human creators.",
    liveHref: "https://influencer-hub-production-23f6.up.railway.app/",
    liveLabel: "Live",
  },
];

export const statusLabel: Record<CaseStudyStatus, string> = {
  live: "Live",
  released: "Released",
  completed: "Completed",
  "pending-shopify": "Pending Shopify",
  "coming-soon": "Coming soon",
};

export function studiesByCategory(category: CaseStudy["category"]) {
  return caseStudies.filter((c) => c.category === category);
}
