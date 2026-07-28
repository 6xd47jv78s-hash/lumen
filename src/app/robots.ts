import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal progress view — nothing to index, and it's empty without
      // this browser's local storage anyway.
      disallow: "/dashboard",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
