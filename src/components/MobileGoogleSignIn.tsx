"use client";

import { useEffect, useId, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const APP_RETURN = "arsalanstudio://oauthredirect";

function returnToApp(idToken: string) {
  const url = `${APP_RETURN}#id_token=${encodeURIComponent(idToken)}`;
  window.location.replace(url);
}

export function MobileGoogleSignIn({ clientId }: { clientId: string }) {
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const buttonId = `google-btn-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (!clientId) {
      setError(
        "Google sign-in is not configured (missing AUTH_GOOGLE_ID on the server).",
      );
      return;
    }

    let cancelled = false;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (cancelled || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response?.credential) {
            setError("Google did not return an ID token.");
            return;
          }
          returnToApp(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
      });
      const el = document.getElementById(buttonId);
      if (el) {
        window.google.accounts.id.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 320,
        });
      }
      setReady(true);
      // One Tap can fail inside in-app browsers; button remains the reliable path.
      try {
        window.google.accounts.id.prompt();
      } catch {
        // ignore
      }
    };
    script.onerror = () => {
      if (!cancelled) setError("Could not load Google Sign-In.");
    };
    document.body.appendChild(script);
    return () => {
      cancelled = true;
      script.remove();
    };
  }, [buttonId, clientId]);

  return (
    <div className="w-full max-w-sm space-y-4">
      {!clientId ? null : <div id={buttonId} className="flex justify-center" />}
      {!ready && clientId && !error ? (
        <p className="text-sm text-muted">Loading Google…</p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <p className="text-xs text-muted">
        After choosing an account, the app should reopen. If it does not, return to
        the app and try again.
      </p>
    </div>
  );
}
