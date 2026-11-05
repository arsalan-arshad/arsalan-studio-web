/** Free GA4 helpers — no-op unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set. */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

export function isGaEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;
  window.gtag?.("event", name, params);
}

export function trackPageView(path: string) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;
  window.gtag?.("event", "page_view", {
    page_path: path,
  });
}
