export type ReviewSource = "clutch" | "fiverr";

export type ClientReview = {
  id: string;
  source: ReviewSource;
  rating: number;
  quote: string;
  author: string;
  role: string;
  company?: string;
  project?: string;
  href: string;
  verified?: boolean;
  note?: string;
};

/**
 * Public marketplace reviews. Clutch quotes are attributed to the Digitize Turf
 * Clutch profile (earlier personal brand); studio brand is now Arsalan Arshad.
 * Fiverr links to the live profile — open for full reviews.
 */
export const reviews: ClientReview[] = [
  {
    id: "clutch-personality-pool",
    source: "clutch",
    rating: 5,
    quote:
      "They were available at any time we needed them. Thanks to their efforts the app launched successfully, resulting in a $300,000 venture capital investment — their high skill matrix was pivotal.",
    author: "CTO",
    role: "CTO",
    company: "Personality Pool",
    project: "Mobile app development & implementation",
    href: "https://clutch.co/profile/digitize-turf",
    verified: true,
    note: "Clutch · Digitize Turf profile",
  },
  {
    id: "clutch-xpit",
    source: "clutch",
    rating: 5,
    quote:
      "They always delivered on time. Views built, Google Maps integrated, deployment bugs fixed — features and quality matched the scope every time.",
    author: "CTO",
    role: "CTO",
    company: "Xpit SPA",
    project: "React Native mobile views & maps",
    href: "https://clutch.co/profile/digitize-turf",
    verified: true,
    note: "Clutch · Digitize Turf profile",
  },
  {
    id: "clutch-ourcrew",
    source: "clutch",
    rating: 5,
    quote:
      "They solved the problem that no one else could! The Expo project compiled and ran effectively — open to feedback, clear communication, great service.",
    author: "Owner",
    role: "Owner",
    company: "OurCrew",
    project: "React Native / Expo rescue",
    href: "https://clutch.co/profile/digitize-turf",
    verified: true,
    note: "Clutch · Digitize Turf profile",
  },
  {
    id: "fiverr-profile",
    source: "fiverr",
    rating: 5,
    quote:
      "Long-running 5★ Fiverr practice for mobile, web, and product delivery. Read current buyer reviews on the live profile.",
    author: "Fiverr buyers",
    role: "Marketplace",
    project: "Freelance delivery",
    href: "https://www.fiverr.com/s/BbbENqW",
    note: "Open Fiverr for full review history",
  },
];

export const reviewStats = {
  clutchAverage: 5.0,
  clutchCount: 3,
  clutchHref: "https://clutch.co/profile/digitize-turf",
  fiverrHref: "https://www.fiverr.com/s/BbbENqW",
};
