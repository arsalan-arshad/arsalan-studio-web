import { CaseStudiesSection } from "@/components/CaseStudiesSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Products on waitlist (WildWindow), AI architecture (Pathwise, Gatekeeper), Shopify apps, full Salesforce suite with demos, and libraries & web products.",
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    url: "/work",
    title: "Work · Case studies",
    description:
      "Products, AI, Shopify, Salesforce, and libraries & web products — case studies from Arsalan Arshad Studio.",
  },
};

export default function WorkPage() {
  return (
    <div className="pt-14">
      <CaseStudiesSection />
    </div>
  );
}
