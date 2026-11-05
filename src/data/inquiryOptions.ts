/** Marketplace brief options — not a narrow tech checklist. */
export const projectNeeds = [
  { id: "shopify-app", label: "Shopify app" },
  { id: "salesforce", label: "Salesforce package / integration" },
  { id: "mobile-any", label: "Mobile app (any stack)" },
  { id: "web-product", label: "Web product" },
  { id: "ai-automation", label: "AI / automation" },
  { id: "design-build", label: "Design + build" },
  { id: "retainer", label: "Ongoing retainer / daily collaboration" },
  { id: "audit-rescue", label: "Audit / rescue" },
  { id: "other", label: "Other" },
] as const;

export type ProjectNeedId = (typeof projectNeeds)[number]["id"];
