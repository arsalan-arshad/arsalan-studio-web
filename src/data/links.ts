export type PresenceLink = {
  id: string;
  label: string;
  href: string;
  group: "social" | "marketplace" | "influencer" | "studio";
  note?: string;
};

/** Live presence — pages and marketplaces where clients can find Arsalan. */
export const presenceLinks: PresenceLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/arsalan.dev/",
    group: "social",
    note: "Personal",
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://www.github.com/arsalan-arshad",
    group: "social",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/arsalandev",
    group: "social",
  },
  {
    id: "toptal",
    label: "Toptal",
    href: "https://www.toptal.com/developers/resume/arsalan-arshad",
    group: "marketplace",
  },
  {
    id: "upwork",
    label: "Upwork",
    href: "https://www.upwork.com/freelancers/~016f6b130756ef1f1d",
    group: "marketplace",
  },
  {
    id: "fiverr",
    label: "Fiverr",
    href: "https://www.fiverr.com/s/BbbENqW",
    group: "marketplace",
  },
  {
    id: "clutch",
    label: "Clutch · Digitize Turf",
    href: "https://clutch.co/profile/digitize-turf",
    group: "studio",
    note: "Earlier personal brand · reviews on this Clutch profile",
  },
  {
    id: "nana",
    label: "Nana Says",
    href: "https://www.instagram.com/nanadotsays/",
    group: "influencer",
    note: "AI character · Stockroom Studio",
  },
  {
    id: "pallet",
    label: "Pallet the Robot",
    href: "https://www.instagram.com/pallet.the.robot/",
    group: "influencer",
    note: "AI character · Stockroom Studio",
  },
  {
    id: "influencer-hub",
    label: "Influencer Hub",
    href: "https://influencer-hub-production-23f6.up.railway.app/",
    group: "influencer",
    note: "Live app · Stockroom Studio",
  },
];

export const footerNav = [
  { href: "/#offers", label: "Offers" },
  { href: "/work", label: "Work" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#faq", label: "FAQ" },
  { href: "/work/salesforce-demo", label: "SF demo" },
  { href: "/#presence", label: "Presence" },
  { href: "/#experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
  { href: "/chat", label: "Messages" },
] as const;
