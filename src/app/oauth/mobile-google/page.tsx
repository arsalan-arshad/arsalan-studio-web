import { MobileGoogleSignIn } from "@/components/MobileGoogleSignIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Continue with Google",
  robots: { index: false, follow: false },
};

/**
 * Mobile Google sign-in bridge.
 * Uses Google Identity Services (JS origin only — no OAuth redirect URI).
 * Returns an id_token to the app via arsalanstudio://oauthredirect.
 */
export default function MobileGoogleOAuthPage() {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim() || "";

  return (
    <main className="section-pad mx-auto max-w-lg pt-24 text-center">
      <p className="eyebrow">Account</p>
      <h1 className="section-title mt-3">Continue with Google</h1>
      <p className="mt-3 text-muted">
        Sign in for the Arsalan Studio app. You’ll return to the app automatically.
      </p>
      <div className="mt-10 flex justify-center">
        <MobileGoogleSignIn clientId={clientId} />
      </div>
    </main>
  );
}
