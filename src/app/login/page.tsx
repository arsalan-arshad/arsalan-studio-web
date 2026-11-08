import { LoginForm } from "@/components/LoginForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );

  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-lg text-center">
        <p className="eyebrow">Account</p>
        <h1 className="section-title mt-3">Log in</h1>
        <p className="mt-3 text-muted">
          Continue briefs and file threads on arsalandev.studio.
        </p>
      </div>
      <div className="mt-10">
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <LoginForm googleEnabled={googleEnabled} />
        </Suspense>
      </div>
    </div>
  );
}
