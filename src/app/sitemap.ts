import type { MetadataRoute } from "next";
import { ALL_LESSONS, ORDERED_TRACKS } from "@/lib/content/registry";
import { SITE_URL } from "@/lib/site";

/**
 * Top-level routes, with their crawl priority.
 *
 * Exported so a test can assert it against the actual `src/app` tree — adding a
 * page and forgetting the sitemap is a silent omission that nothing else would
 * catch, and it happened once already with /live.
 */
export const SITEMAP_ROUTES = [
  { path: "", priority: 1 },
  { path: "/learn", priority: 0.9 },
  { path: "/practice", priority: 0.8 },
  { path: "/live", priority: 0.8 },
  { path: "/watch", priority: 0.7 },
  { path: "/news", priority: 0.6 },
  { path: "/glossary", priority: 0.6 },
] as const;

/**
 * Routes deliberately kept out of the sitemap. `/dashboard` is a personal
 * progress view that is empty without the visitor's own local storage, and
 * robots.txt disallows it — listing it in the sitemap as well would be
 * contradictory.
 */
export const SITEMAP_EXCLUDED = ["/dashboard"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = SITEMAP_ROUTES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p.priority,
  }));

  const trackPages = ORDERED_TRACKS.map((t) => ({
    url: `${SITE_URL}/learn/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const lessonPages = ALL_LESSONS.map((l) => ({
    url: `${SITE_URL}/learn/${l.track.slug}/${l.lesson.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...trackPages, ...lessonPages];
}
