import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-lg text-center">
        <p className="eyebrow">Account</p>
        <h1 className="section-title mt-3">Forgot password</h1>
        <p className="mt-3 text-muted">
          We’ll email a secure link to set a new password.
        </p>
      </div>
      <div className="mt-10">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
