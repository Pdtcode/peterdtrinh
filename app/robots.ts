import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /sport is a private workspace, unlinked and password-gated. Excluding
    // it here keeps well-behaved crawlers away; the gate is what actually
    // keeps people out.
    rules: { userAgent: "*", allow: "/", disallow: ["/sport", "/api/sport"] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
