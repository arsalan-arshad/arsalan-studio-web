import type { Metadata } from "next";
import { VerifyEmailClient } from "@/components/VerifyEmailClient";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Verify email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-md">
        <p className="eyebrow">Account</p>
        <h1 className="section-title mt-3">Verify email</h1>
        <Suspense fallback={<p className="mt-6 text-muted">Checking link…</p>}>
          <VerifyEmailClient />
        </Suspense>
      </div>
    </div>
  );
}
