import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Set password",
};

export default function SetPasswordPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-lg text-center">
        <p className="eyebrow">Account</p>
        <h1 className="section-title mt-3">Set your password</h1>
        <p className="mt-3 text-muted">
          You were invited to Arsalan Studio. Choose a strong password to finish
          setup.
        </p>
      </div>
      <div className="mt-10">
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <ResetPasswordForm mode="invite" />
        </Suspense>
      </div>
    </div>
  );
}
