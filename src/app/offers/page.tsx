import { OffersSection } from "@/components/OffersSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offers",
  description:
    "Productized packages: Shopify App Build, Salesforce Package, Mobile RN Delivery, Retainer.",
  alternates: {
    canonical: "/offers",
  },
  openGraph: {
    url: "/offers",
    title: "Offers · Studio packages",
    description:
      "Shopify, Salesforce, mobile/web, and retainer collaboration with Arsalan Arshad.",
  },
};

export default function OffersPage() {
  return (
    <div className="pt-14">
      <OffersSection />
    </div>
  );
}
