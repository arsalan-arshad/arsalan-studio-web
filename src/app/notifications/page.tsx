import type { Metadata } from "next";
import { NotificationsPageClient } from "@/components/NotificationsPageClient";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto mb-8 max-w-3xl">
        <p className="eyebrow">Inbox</p>
        <h1 className="section-title mt-3">Notifications</h1>
        <p className="mt-3 max-w-xl text-muted">
          Chat replies and contact inquiries — mark items read as you go.
        </p>
      </div>
      <NotificationsPageClient />
    </div>
  );
}
