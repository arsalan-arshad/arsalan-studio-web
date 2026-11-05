import { ContactForm } from "@/components/ContactForm";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Inquire about Shopify, Salesforce, mobile, or retainer work.",
};

export default function ContactPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Contact</p>
        <h1 className="section-title mt-3">Get started</h1>
        <p className="mt-4 max-w-xl text-muted">
          Tell me what you need. Prefer messaging with attachments?{" "}
          <Link
            href="/signup"
            className="text-accent underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
          .
        </p>
        <div className="mt-10">
          <Suspense fallback={<p className="text-muted">Loading form…</p>}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
