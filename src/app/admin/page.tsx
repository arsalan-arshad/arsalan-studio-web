import { AdminDesk } from "@/components/AdminDesk";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin desk",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="section-pad pt-20">
      <AdminDesk />
    </div>
  );
}
