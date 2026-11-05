import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${brand.domain}`;

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/chat", "/verify-email"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
