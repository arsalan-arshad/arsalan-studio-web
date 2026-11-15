/** Brand constants — primary domain purchased. */
export const brand = {
  name: "Arsalan Arshad",
  shortName: "Arsalan",
  tagline:
    "Shopify and Salesforce apps, mobile and web products — built and shipped by one engineer.",
  email: "arsalanarshad.dev@gmail.com",
  /** Studio chat / outreach From address */
  studioEmail: "hello@arsalandev.studio",
  /** Primary domain */
  domain: "arsalandev.studio",
  packageId: "studio.arsalan.app",
  expoSlug: "arsalan-studio",
  host: "Railway",
  /**
   * Homepage capacity line — single source for project count.
   * Change this number to update the status copy (word form when mapped).
   */
  openProjectSlots: 2,
  /** Live Clutch profile under current personal brand (same mark as the mobile app) */
  clutch: "https://clutch.co/profile/arsalan-arshad",
  /** App / Clutch profile mark — matches studio.arsalan.app icon.png */
  clutchIcon: "/brands/app/clutch-icon.png",
  /** Earlier personal brand name only — Clutch is no longer Digitize Turf */
  pastBrand: {
    name: "Digitize Turf",
  },
} as const;

/** Small-integer words for capacity copy; falls back to numeral. */
const OPEN_SLOT_WORDS: Record<number, string> = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
};

export function formatOpenProjectSlots(
  count: number = brand.openProjectSlots,
): string {
  return OPEN_SLOT_WORDS[count] ?? String(count);
}

/** Homepage status line derived from `brand.openProjectSlots`. */
export function capacityStatusCopy(
  count: number = brand.openProjectSlots,
): string {
  return `Taking on ${formatOpenProjectSlots(count)} new projects now. Reply and I start this week.`;
}
