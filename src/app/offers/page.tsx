import { OffersSection } from "@/components/OffersSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offers",
  description:
    "Productized packages: Shopify App Build, Salesforce Package, Mobile RN Delivery, Retainer.",
};

export default function OffersPage() {
  return (
    <div className="pt-14">
      <OffersSection />
    </div>
  );
}
