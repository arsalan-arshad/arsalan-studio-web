import type { MetadataRoute } from "next";
import { allCaseStudyIds } from "@/data/caseStudyDetails";
import { brand } from "@/lib/brand";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${brand.domain}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/offers",
    "/work",
    "/work/salesforce-demo",
    "/contact",
    "/login",
    "/signup",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/offers" || path === "/contact"
          ? 0.9
          : 0.7,
  }));

  const workRoutes: MetadataRoute.Sitemap = allCaseStudyIds().map((id) => ({
    url: `${base}/work/${id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...workRoutes];
}
