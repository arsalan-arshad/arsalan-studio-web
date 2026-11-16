import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { AdminEmailSender } from "@/components/AdminEmailSender";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Send email",
  robots: { index: false, follow: false },
};

export default async function AdminEmailPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.role)) {
    redirect("/admin");
  }

  return (
    <div className="section-pad pt-20">
      <AdminEmailSender />
    </div>
  );
}
