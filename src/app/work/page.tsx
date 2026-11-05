import { CaseStudiesSection } from "@/components/CaseStudiesSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Shopify apps, full Salesforce suite with demos, other products, and coming-soon launches.",
};

export default function WorkPage() {
  return (
    <div className="pt-14">
      <CaseStudiesSection showBanners />
    </div>
  );
}
