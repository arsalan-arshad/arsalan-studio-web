import type { MetadataRoute } from "next";
import { allCaseStudyIds } from "@/data/caseStudyDetails";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
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
          : path === "/work"
            ? 0.85
            : 0.7,
  }));

  const workRoutes: MetadataRoute.Sitemap = allCaseStudyIds().map((id) => ({
    url: `${base}/work/${id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...workRoutes];
}
