import { AdminPasswordForm } from "@/components/AdminPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <div className="section-pad pt-20">
      <AdminPasswordForm />
    </div>
  );
}
