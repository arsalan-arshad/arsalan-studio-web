"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Fallback deep-link landing for mobile Google auth.
 * Prefer /oauth/mobile-google (GIS). This page forwards query/hash to the app scheme.
 */
export default function OAuthRedirectPage() {
  const [href, setHref] = useState("");

  const appHref = useMemo(() => {
    if (!href) return "";
    try {
      const url = new URL(href);
      return `arsalanstudio://oauthredirect${url.search}${url.hash}`;
    } catch {
      return "";
    }
  }, [href]);

  useEffect(() => {
    setHref(window.location.href);
    try {
      const url = new URL(window.location.href);
      window.location.replace(
        `arsalanstudio://oauthredirect${url.search}${url.hash}`,
      );
    } catch {
      // ignore
    }
  }, []);

  return (
    <main className="section-pad mx-auto max-w-lg pt-24 text-center">
      <p className="eyebrow">Google sign-in</p>
      <h1 className="section-title mt-3">Returning to the app…</h1>
      <p className="mt-3 text-muted">
        If the Arsalan Studio app does not open, close this window and try again
        from the app.
      </p>
      {appHref ? (
        <p className="mt-8">
          <a className="btn-ghost inline-flex" href={appHref}>
            Open Arsalan Studio
          </a>
        </p>
      ) : null}
    </main>
  );
}
