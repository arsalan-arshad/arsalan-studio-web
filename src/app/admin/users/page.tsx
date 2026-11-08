import { AdminUsers } from "@/components/AdminUsers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin users",
  robots: { index: false, follow: false },
};

export default function AdminUsersPage() {
  return (
    <div className="section-pad pt-20">
      <AdminUsers />
    </div>
  );
}
