/**
 * Canonical origin, used for metadata, the sitemap and social cards.
 * Set NEXT_PUBLIC_SITE_URL at deploy time; the fallback keeps local builds and
 * previews working without configuration.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_NAME = "MarketLab";

export const SITE_DESCRIPTION =
  "A free, serious course in how financial markets actually work — chart reading, strategy, risk management and market psychology, taught to a professional standard for 14–18 year olds.";
