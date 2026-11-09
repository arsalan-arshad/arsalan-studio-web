import { CaseStudiesSection } from "@/components/CaseStudiesSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "AI architecture (Pathwise), Shopify apps, full Salesforce suite with demos, other products, and coming-soon launches.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    url: "/work",
    title: "Work · Case studies",
    description:
      "AI, Shopify, Salesforce, and other products — case studies from Arsalan Arshad Studio.",
  },
};

export default function WorkPage() {
  return (
    <div className="pt-14">
      <CaseStudiesSection showBanners />
    </div>
  );
}
