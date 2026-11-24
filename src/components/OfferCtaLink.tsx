"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type OfferCtaLinkProps = {
  href: string;
  offerId: string;
  children: ReactNode;
  className?: string;
};

/** Offer card CTA — tracks clicks when GA is configured. */
export function OfferCtaLink({
  href,
  offerId,
  children,
  className,
}: OfferCtaLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent("offer_cta_click", { offer_id: offerId })}
    >
      {children}
    </Link>
  );
}
