import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-lg text-center">
        <p className="eyebrow">Account</p>
        <h1 className="section-title mt-3">Reset password</h1>
        <p className="mt-3 text-muted">Choose a strong new password for your account.</p>
      </div>
      <div className="mt-10">
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
