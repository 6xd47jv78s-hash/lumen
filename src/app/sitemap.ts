import type { MetadataRoute } from "next";
import { ALL_LESSONS, ORDERED_TRACKS } from "@/lib/content/registry";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1 },
    { path: "/learn", priority: 0.9 },
    { path: "/practice", priority: 0.8 },
    { path: "/watch", priority: 0.7 },
    { path: "/news", priority: 0.6 },
    { path: "/glossary", priority: 0.6 },
    { path: "/dashboard", priority: 0.3 },
  ].map((p) => ({
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
