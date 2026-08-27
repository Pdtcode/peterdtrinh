import type { MetadataRoute } from "next";

import { features, siteConfig } from "@/config/site";
import { getAllBlogPostSlugs } from "@/lib/sanity-queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Higher priority on the routes that matter for hiring; the creative and
  // stream pages stay indexed but rank below them.
  const priorities: Record<string, number> = {
    "": 1,
    "/projects": 0.9,
    "/resume": 0.9,
    "/about": 0.8,
    "/stream": 0.4,
  };

  if (features.creative) priorities["/creative"] = 0.5;
  if (features.writing) priorities["/blog"] = 0.7;

  const routes = Object.keys(priorities).map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: priorities[route],
  }));

  let postRoutes: MetadataRoute.Sitemap = [];

  if (features.writing) {
    try {
      const slugs = await getAllBlogPostSlugs();

      postRoutes = slugs.map((slug) => ({
        url: `${siteConfig.url}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.6,
      }));
    } catch {
      postRoutes = [];
    }
  }

  return [...routes, ...postRoutes];
}
