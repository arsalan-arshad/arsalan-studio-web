import { caseStudies, type CaseStudy, type CaseStudyStatus } from "./caseStudies";

export type CaseStudyDetail = CaseStudy & {
  summary: string;
  problem: string;
  solution: string;
  audience: string;
  usage: string[];
  stack: string[];
  architecture: string[];
  features: string[];
  openSource: {
    license: string;
    note: string;
  };
  buildingNote?: string;
};

const details: Record<string, Omit<CaseStudyDetail, keyof CaseStudy>> = {
  "ai-forecast-agent": {
    summary:
      "Embedded Shopify app that forecasts inventory with auditable math, then lets a BYOK AI co-pilot explain those numbers — never invent them.",
    problem:
      "Many App Store “AI” inventory tools are chatbots wrapping a single LLM call. Numbers can’t be audited, and merchants pay monthly for guesses.",
    solution:
      "Dual-engine design: a pure deterministic forecasting engine (WMA, reorder point, days-of-cover, stock status) plus a grounded conversational agent whose prompt is rebuilt from a server-side forecast snapshot on every request. Free to install; merchants bring Gemini or Claude keys (BYOK), encrypted at rest.",
    audience:
      "Shopify merchants and partners who need trustworthy stockout / reorder signals and an AI that stays grounded in those signals.",
    usage: [
      "Install from the Shopify App Store (public $0 Free plan).",
      "Connect inventory & order history; configure lead times per SKU or shop-wide.",
      "Review forecast dashboard classifications (reorder_now / soon / healthy / no_recent_sales).",
      "Optionally add a BYOK AI key to ask grounded questions about the snapshot.",
    ],
    stack: [
      "Remix 2 (Vite)",
      "Shopify Polaris / Admin API",
      "Node ≥ 20",
      "Railway hosting",
      "AES-256-GCM for BYOK keys",
    ],
    architecture: [
      "forecasting.js — pure math, no network, same inputs → same outputs",
      "Server-built forecast snapshot for AI chat (never trust client-supplied numbers)",
      "Per-shop AI rate limiting and usage logging",
      "Multi-location inventory summed across locations",
    ],
    features: [
      "Weighted moving average demand & reorder-point math",
      "Days-of-cover and stock-status classification",
      "BYOK Gemini / Claude co-pilot with grounding tests",
      "Encrypted API key storage; no shared server AI key",
      "Open source MIT — PRs and discussions welcome",
    ],
    openSource: {
      license: "MIT",
      note: "Public GitHub repo. Issues, feature ideas, and pull requests are welcome.",
    },
  },
  "pipeline-aware-forecast": {
    summary:
      "Shopify forecast that folds open Salesforce wholesale pipeline into forward demand — three scenarios, read-only CRM pull.",
    problem:
      "Brands selling D2C on Shopify and wholesale via Salesforce see only retail history in inventory planning. Pipeline collisions show up after deals close.",
    solution:
      "Deterministic engine turns Opportunity line items into weighted B2B demand per SKU per week, merges with retail demand, and recomputes stockout / order-by dates. Three scenarios side by side. v1 is read-only on Salesforce; no AI invents numbers.",
    audience:
      "Hybrid retail + wholesale brands whose sales team lives in Salesforce and ops lives in Shopify.",
    usage: [
      "Connect a read-only Salesforce External Client App.",
      "Map ProductCode ↔ Shopify SKUs; review unmatched SKUs.",
      "Refresh pipeline snapshots on a schedule or manually.",
      "Compare retail-only vs weighted pipeline vs “if every deal closes.”",
    ],
    stack: [
      "React Router 7 (Vite)",
      "Polaris",
      "Prisma + PostgreSQL",
      "Salesforce REST / SOQL (read-only)",
      "AES-256-GCM credentials",
    ],
    architecture: [
      "pipeline-demand.js — opportunities → weighted weekly demand",
      "burn-down.js — stock + demand streams → stockout dates",
      "sku-matching.js — ProductCode ↔ SKU rules",
      "Scheduled + manual pipeline puller → PipelineSnapshot",
    ],
    features: [
      "Weighted pipeline demand by stage probability",
      "Three scenarios (retail / weighted / all-close)",
      "Unmatched SKU data-quality panel",
      "Read-only Salesforce by design",
      "MIT — open for PRs (early development)",
    ],
    openSource: {
      license: "MIT",
      note: "Public repo. Early development — not installable yet; contributions welcome on the engine and docs.",
    },
    buildingNote:
      "Honest status: engine, SF client, sync, and app shell are built and tested. Pending Shopify Partner review / App Store listing — not a vague “coming soon.” AI explain layer is explicitly out of v1.",
  },
  "bridge-core-recipes": {
    summary:
      "Small Shopify → Salesforce core with opinionated recipes — useful signals, dry-run first, not a mirror of the whole store.",
    problem:
      "Horizontal sync floods Salesforce; Zapier-style tools charge per task and leave rule design to the merchant.",
    solution:
      "Boring reliable core (signed webhooks, durable queue, retries, DLQ replay, Salesforce client, audit log) plus narrow recipes. Dry-run mode, kill switch, encrypted credentials. Recipe R1 exercised against a SF Developer org and Shopify development store.",
    audience:
      "Teams that want specific commerce signals in Salesforce without buying a full sync engine.",
    usage: [
      "Connect Salesforce via admin CLI or password-gated /admin.",
      "Enable a recipe in dry-run; inspect sync log.",
      "Go live only when dry-run decisions look right.",
      "Replay failed jobs; review privacy/compliance log.",
    ],
    stack: [
      "Node ≥ 22",
      "Postgres queue + retention windows",
      "Shopify webhooks (HMAC)",
      "Salesforce client",
      "Optional embedded Shopify admin",
    ],
    architecture: [
      "Webhook gateway → durable jobs → recipe executor",
      "Dry-run / live / kill-switch states per recipe",
      "Privacy webhooks: customers/data_request, redact, shop/redact, app/uninstalled",
      "Single-operator admin with CSRF + session cookie",
    ],
    features: [
      "Dry-run before any Salesforce write",
      "Dead-letter replay",
      "Encrypted stored credentials",
      "Compliance page for privacy requests",
      "MIT — open for PRs (developer preview)",
    ],
    openSource: {
      license: "MIT",
      note: "Developer preview — not App Store reviewed. PRs on recipes and core hardening welcome.",
    },
    buildingNote:
      "Pending Shopify Partner review / App Store listing. Core + recipes work in developer preview; production listing is the gate — not a vague “coming soon.” Working name may change for listing rules.",
  },
  "practitioner-protocols": {
    summary:
      "Practitioners share product “protocols” by link or QR; clients one-tap add the whole list to a Shopify cart. Zero PII by design.",
    problem:
      "Professional brands sell through practitioners, but clients forget recommendations and buy elsewhere — brands can’t attribute which practices drive sales.",
    solution:
      "A protocol is a reusable recommendation list with share tokens and a theme-native storefront page. Attribution via aggregate counters only — validator rejects patient/client PII keys. Engine, admin, and storefront modules verified with a large automated suite; live on Railway with Postgres.",
    audience:
      "DTC / professional brands (wellness, clinic-adjacent retail) that sell through practitioners on Shopify.",
    usage: [
      "Merchant admin: enrol / approve practitioners.",
      "Practitioner builds a protocol (search products, qty, notes).",
      "Share permanent link or QR with clients.",
      "Client opens storefront page → Add all to cart at retail prices.",
    ],
    stack: [
      "Shopify App Proxy + Liquid renderers",
      "PostgreSQL",
      "Railway hosting",
      "Cryptographic share tokens",
      "App Bridge merchant admin",
    ],
    architecture: [
      "Zero-PII validation barrier on protocol payloads",
      "Share token entropy ≥ 95 bits",
      "Cart line properties for protocol attribution",
      "orders/paid webhook path for aggregate attribution",
    ],
    features: [
      "Link / QR protocol sharing",
      "One-tap add-all cart",
      "Print-friendly handout mode",
      "Pending practitioner enrolment workflow",
      "MIT — open for PRs",
    ],
    openSource: {
      license: "MIT",
      note: "Open for PRs and discussions. Engine verified with extensive unit coverage; some milestones pending live verification.",
    },
    buildingNote:
      "Strong local/dev-store verification; App Store listing may still be in progress. Status treated as coming soon / launching on this marketplace until publicly listed.",
  },
  "inventory-mcp": {
    summary:
      "Read-only MCP server that returns deterministic inventory forecasts so AI assistants explain numbers they didn’t invent.",
    problem:
      "Assistants can read inventory but guessed reorder numbers are dangerous. Official Shopify MCP covers storefront/cart — not Admin inventory forecasting.",
    solution:
      "Four MCP tools over local stdio (env BYOK) or hosted Streamable HTTP. Hosted users send Shopify credentials in headers (no shared Bearer gate). Same WMA / days-of-cover / reorder formulas as Agent Forecast.",
    audience:
      "Merchants and developers who use AI assistants (Cursor, Claude Desktop, etc.) and want auditable stock forecasts.",
    usage: [
      "Local: spawn stdio server with Shopify env creds.",
      "Hosted: point MCP client at Railway /mcp with X-Shopify-* headers.",
      "Call list_at_risk_skus, get_sku_forecast, get_reorder_suggestion, explain_forecast_inputs.",
    ],
    stack: [
      "TypeScript / Node ≥ 20",
      "MCP Streamable HTTP + stdio",
      "Shopify Admin API (client credentials or legacy token)",
      "Railway Docker deploy",
    ],
    architecture: [
      "Deterministic forecasting core (not ML)",
      "Hosted = infrastructure only; BYOK via headers",
      "v0 lead times store-wide; per-SKU config planned for v1",
      "Multi-location: sum available",
    ],
    features: [
      "list_at_risk_skus",
      "get_sku_forecast",
      "get_reorder_suggestion",
      "explain_forecast_inputs (auditable formulas)",
      "MIT — open for PRs",
    ],
    openSource: {
      license: "MIT",
      note: "Released v0.2.x. Contributions welcome on tools, docs, and evals.",
    },
  },
  "smart-record-cloner": {
    summary:
      "Salesforce deep-clone utility with smart date shifting, child tagging, active-only filters, and Agentforce/Flow invocable actions.",
    problem:
      "Native Salesforce clone is shallow or awkward for related lists, dates, and status resets — admins cobble workarounds.",
    solution:
      "LWC modal/page action + Apex DeepCloneService with savepoint atomicity. Configurable date shift, child name suffix, active-only children, status reset. Invocable for Flow and Agentforce.",
    audience:
      "Admins, consultants, and Agentforce builders who need reliable deep clones of Accounts, Opportunities, and related trees.",
    usage: [
      "Assign Smart_Record_Cloner_User permission set.",
      "Add Lightning Web Component quick action on target objects.",
      "Configure superpowers panel; select related lists; clone.",
      "Or call Smart Deep Clone Record from Flow / Agentforce.",
    ],
    stack: ["LWC", "Apex (with sharing)", "Jest + Apex tests", "2GP unlocked package"],
    architecture: [
      "DeepCloneService — describe + clone engine",
      "DeepCloneController — AuraEnabled for LWC",
      "DeepCloneInvocable — Flow / Agentforce",
      "Savepoint rollback on any child failure",
    ],
    features: [
      "Smart date shifting & status reset",
      "Child name tagging & active-only filter",
      "Celebration summary UI",
      "Interactive HTML demo on this site",
      "MIT — open for PRs; AppExchange in review",
    ],
    openSource: {
      license: "MIT",
      note: "GitHub PRs welcome. Packaged 2GP with install URL for orgs.",
    },
  },
  "clean-flow-toast": {
    summary:
      "Drop-in Flow UI notifications — rich toasts, Web Audio cues, confetti, sticky bars, and Platform Event listeners.",
    problem:
      "Standard Flows can’t fire rich native toasts without heavy Aura hacks or custom code.",
    solution:
      "Zero-friction LWC for Flow screens plus headless Platform Event path for notifications after screenless automations.",
    audience:
      "Salesforce admins and developers shipping Flow experiences that need clear user feedback.",
    usage: [
      "Install 2GP package.",
      "Place component on a Flow screen or subscribe via Platform Events.",
      "Configure toast copy, sound, confetti, sticky actions.",
    ],
    stack: ["LWC", "Apex", "Web Audio", "Canvas confetti", "Platform Events", "2GP"],
    architecture: [
      "Screen component for interactive Flows",
      "Event listener path for headless completion signals",
      "SLDS-aligned UI with optional celebration effects",
    ],
    features: [
      "Web Audio synthesizer cues",
      "Confetti particles",
      "Sticky actionable toast bar",
      "Interactive demo on this site",
      "MIT — open for PRs",
    ],
    openSource: {
      license: "MIT",
      note: "Contributions and AppExchange feedback welcome.",
    },
  },
  "universal-quick-file": {
    summary:
      "Record-page file gallery with lightbox, bulk ZIP download, drag-and-drop upload, and Agentforce summarizer readiness.",
    problem:
      "Working with files on Salesforce record pages is clunky — previews, bulk download, and upload UX are fragmented.",
    solution:
      "LWC gallery with thumbnails, keyboard lightbox, native bulk ZIP, and drag-and-drop uploader on the record page.",
    audience: "Teams that live on record pages and move documents constantly (sales, service, ops).",
    usage: [
      "Install package; place LWC on Lightning record pages.",
      "Browse thumbnails; open lightbox; bulk ZIP download.",
      "Drag-and-drop upload to the record.",
    ],
    stack: ["LWC", "Apex", "ContentDocument APIs", "2GP", "Jest"],
    architecture: [
      "Record-page targeted LWC",
      "Server Apex for bulk ZIP assembly",
      "Optional Agentforce summarizer hook",
    ],
    features: [
      "High-res thumbnail grid",
      "Fullscreen lightbox with keyboard nav",
      "1-click bulk ZIP",
      "Drag-and-drop uploader",
      "MIT — open for PRs",
    ],
    openSource: {
      license: "MIT",
      note: "Open source 2GP — PRs and issues welcome.",
    },
  },
  "shopify-sf-connector": {
    summary:
      "Shopify ↔ Salesforce connector focused on useful commerce signals — HMAC webhooks, DLQ retries, mapping UI, no per-task fees.",
    problem:
      "Merchants pay per sync task or drown CRM users in full-catalog mirrors.",
    solution:
      "Real-time Customer/Order/Lead-style ingestion via verified webhooks, dead-letter queue retries, and custom metadata mapping LWC in Setup.",
    audience:
      "B2B/hybrid merchants and Salesforce teams that need Shopify signals without a bloated sync tax.",
    usage: [
      "Install 2GP; configure mapping metadata.",
      "Register Shopify webhooks with HMAC verification.",
      "Monitor DLQ and replay failed jobs.",
    ],
    stack: ["Apex", "LWC Setup mapping UI", "HMAC webhooks", "DLQ retry engine", "2GP"],
    architecture: [
      "Webhook → verify → enqueue → map → Salesforce write",
      "Dead-letter queue with replay",
      "Custom metadata driven field maps",
    ],
    features: [
      "Zero per-task transaction fees by design",
      "HMAC-verified webhooks",
      "DLQ retry engine",
      "Interactive demo",
      "MIT — open for PRs",
    ],
    openSource: {
      license: "MIT",
      note: "Public GitHub. Prefer recipes over kitchen-sink sync — PRs that keep scope honest are welcome.",
    },
  },
  "shopify-ai-forecast-bridge": {
    summary:
      "Bring deterministic inventory intelligence into Salesforce — WMA stockouts plus BYOK conversational agent and opportunity stock checks.",
    problem:
      "Wholesale deals in Salesforce ignore storefront stockout risk computed on Shopify.",
    solution:
      "In-Salesforce forecast views from Shopify-derived math, BYOK AI that explains snapshots, and opportunity validation to protect deals against stockouts.",
    audience:
      "Salesforce sales/ops teams selling wholesale against Shopify inventory reality.",
    usage: [
      "Install package; connect Shopify-derived forecast inputs.",
      "Review executive dashboard & forecast LWC.",
      "Optional BYOK chat for explanations.",
      "Enable opportunity stock validation where appropriate.",
    ],
    stack: ["Apex", "LWC", "BYOK Gemini/Claude", "2GP", "WMA math"],
    architecture: [
      "Deterministic WMA stockout calculations in Salesforce",
      "Conversational agent grounded on server-side snapshot",
      "Opportunity stock validation guardrails",
    ],
    features: [
      "Executive dashboard",
      "Forecast intelligence LWC",
      "Conversational AI chat (BYOK)",
      "Deal protection validator",
      "MIT — open for PRs",
    ],
    openSource: {
      license: "MIT",
      note: "Open source package — contribute improvements and tests via GitHub.",
    },
  },
  "urdu-business-nlu": {
    summary:
      "MIT TypeScript library turning informal Urdu / Roman-Urdu business messages into validated structured records.",
    problem:
      "Orders and payments arrive as messy chat text; wrong quantities/amounts are costly. Few open, tested parsers exist for Urdu business messages.",
    solution:
      "Rules-only propose/extract + deterministic validator and router. Prefer confirm over a wrong number. Optional LLM is BYOK and deferred. Published on npm with a public eval set.",
    audience:
      "Builders of WhatsApp/ERP/shopkeeper tools who need offline, auditable NLU — not a hosted SaaS.",
    usage: [
      "npm i urdu-business-nlu",
      "Call propose/extract → validateRecord → route (auto / confirm / reject).",
      "Extend gold eval examples; run CI tests.",
    ],
    stack: ["TypeScript", "Node ≥ 18", "Vitest / CI", "npm package", "CC-BY-4.0 eval set"],
    architecture: [
      "Normalisers → propose/extract → validateRecord → route",
      "Ungrounded qty/amount → reject; ambiguity → confirm",
      "No network required on rules-only path",
    ],
    features: [
      "Urdu + Roman-Urdu + mixed English",
      "Deterministic validator",
      "Public gold eval set",
      "Silent-error focus",
      "Open for PRs / gold contributions",
    ],
    openSource: {
      license: "MIT (library) · CC-BY-4.0 (eval gold)",
      note: "npm + GitHub. Add gold examples and review PRs welcome — see CONTRIBUTING.",
    },
  },
  "sme-automation": {
    summary:
      "Fixed-scope automation services studio: WhatsApp order capture, inventory alerts, Shopify→Salesforce signals — with open-source recipes.",
    problem:
      "SMEs want finished automation, not another tool — data retyped between chat, sheets, Shopify, and Salesforce.",
    solution:
      "Narrow offers with written exclusions, built in the client’s accounts, approval steps before writes, reusable MIT recipes with client details removed.",
    audience:
      "Distributors, retailers, and hybrid merchants in Pakistan/Gulf and Shopify/Salesforce ecosystems.",
    usage: [
      "Discovery call with fixed checklist.",
      "One-page scope + acceptance tests + fixed price.",
      "Build → demo → handoff → short support window.",
    ],
    stack: ["Depends on offer — Shopify, Salesforce, Sheets/ERP, NLU library"],
    architecture: [
      "Services-led delivery, not a locked SaaS",
      "Human confirmation for uncertain parses",
      "Audit log / approval before money or order writes",
    ],
    features: [
      "Candidate offers O1–O4 documented as hypotheses",
      "Open-source recipe intent",
      "Honest exclusions",
    ],
    openSource: {
      license: "MIT for recipes/templates (client work under agreement)",
      note: "Being scoped — validate with conversations first. Contributions to recipes welcome when published.",
    },
    buildingNote: "No clients or published recipes yet — marketplace entry is intentional and honest.",
  },
  "eu-ai-act-checker": {
    summary:
      "Hypothesis: open scanner for public-site AI Act transparency basics plus optional paid audit report.",
    problem:
      "Site owners may need a technical check for AI Act transparency patterns — without pretending to be legal advice.",
    solution:
      "Planned open scanner + paid report path. Law and dates need verification (spike first).",
    audience: "Site operators and agencies needing a technical transparency checklist.",
    usage: ["Not shipping yet — spike and conversations first."],
    stack: ["TBD after spike"],
    architecture: ["Unvalidated hypothesis — stop if no pull after gates."],
    features: ["Technical check framing", "Not legal advice"],
    openSource: {
      license: "Intended MIT when code exists",
      note: "Coming soon — open to early design feedback.",
    },
    buildingNote: "Unvalidated. No production scanner claimed.",
  },
  "freight-exceptions": {
    summary:
      "Hypothesis: deterministic exception rules for small freight brokers/3PLs; AI extracts and drafts, humans approve.",
    problem:
      "Exception handling is manual and error-prone for small brokers.",
    solution:
      "Rules first; AI only extracts/drafts; humans approve. Needs broker conversations before code.",
    audience: "Small freight brokers and 3PLs.",
    usage: ["Not shipping yet — conversation gate first."],
    stack: ["TBD"],
    architecture: ["Deterministic rules + human approval loop (planned)."],
    features: ["Honest “coming soon” status"],
    openSource: {
      license: "Intended MIT when code exists",
      note: "Open design discussion welcome; no fake demos.",
    },
    buildingNote: "Sourced from research list; needs ~10 broker conversations before build.",
  },
  "influencer-hub": {
    summary:
      "Stockroom Studio hub for AI influencer characters — studio intro, app cards, email signup, privacy page. Labeled as AI characters, not human creators.",
    problem:
      "AI character channels need a simple landing that attributes signups and deep-links to real products without overclaiming.",
    solution:
      "Zero-dependency Node hub: character query tags, signup list on a Railway volume, click counters through /go/<app>, privacy page. No third-party scripts.",
    audience:
      "Visitors from Nana Says / Pallet the Robot Instagram bios; merchants curious about Stockroom Studio.",
    usage: [
      "Open hub with ?c=nana or ?c=pallet.",
      "Browse app cards; optional email signup.",
      "Clicks redirect to Shopify listing or Salesforce GitHub with UTM/campaign tags.",
    ],
    stack: ["Node 18+", "Railway + volume at /data", "Plain HTML/JS public page"],
    architecture: [
      "Campaign tag carried into signup + click stats",
      "Admin CSV/stats behind ADMIN_TOKEN",
      "No IPs, cookies, or third-party scripts",
    ],
    features: [
      "Character-aware signup",
      "App click attribution",
      "Privacy page",
      "Honest “AI character” labeling",
    ],
    openSource: {
      license: "Studio project — ask if you want to contribute patterns",
      note: "Hub is a thin marketing/ops surface; product repos linked from cards remain MIT open source.",
    },
  },
};

export function getCaseStudyDetail(id: string): CaseStudyDetail | undefined {
  const base = caseStudies.find((c) => c.id === id);
  const extra = details[id];
  if (!base || !extra) return undefined;
  return { ...base, ...extra };
}

export function allCaseStudyIds(): string[] {
  return caseStudies.map((c) => c.id);
}

export function statusLabelLong(status: CaseStudyStatus): string {
  switch (status) {
    case "live":
      return "Live in production";
    case "released":
      return "Released (packaged / hosted)";
    case "completed":
      return "Completed library / product";
    case "pending-shopify":
      return "Pending Shopify review / App Store listing";
    case "coming-soon":
      return "Coming soon / launching";
  }
}
