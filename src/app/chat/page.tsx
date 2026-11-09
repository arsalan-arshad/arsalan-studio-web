import { ChatApp } from "@/components/ChatApp";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default function ChatPage() {
  return (
    <div className="section-pad pt-20">
      <div className="mx-auto max-w-6xl mb-8">
        <p className="eyebrow">Collaboration</p>
        <h1 className="section-title mt-3">Messages</h1>
        <p className="mt-3 max-w-xl text-muted">
          Daily threads for briefs, files, and status — same inbox on web and
          mobile.
        </p>
      </div>
      <Suspense fallback={<p className="text-muted px-[clamp(1.25rem,4vw,3.5rem)]">Loading…</p>}>
        <ChatApp />
      </Suspense>
    </div>
  );
}
