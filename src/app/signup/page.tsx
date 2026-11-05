import { SignupForm } from "@/components/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignupPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-lg text-center">
        <p className="eyebrow">Account</p>
        <h1 className="section-title mt-3">Create account</h1>
        <p className="mt-3 text-muted">
          Client accounts unlock messaging, attachments, and project status.
        </p>
      </div>
      <div className="mt-10">
        <SignupForm />
      </div>
    </div>
  );
}
