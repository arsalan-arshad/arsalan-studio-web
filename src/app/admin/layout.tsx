import { Suspense } from "react";
import { AdminGate } from "./AdminGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="section-pad pt-20">
          <p className="text-muted">Checking admin access…</p>
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
