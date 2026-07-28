import assert from "node:assert/strict";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import sitemap, { SITEMAP_EXCLUDED, SITEMAP_ROUTES } from "./sitemap";
import { ALL_LESSONS, ORDERED_TRACKS } from "../lib/content/registry";

/**
 * Adding a page and forgetting the sitemap is invisible: nothing 404s, no test
 * fails, the page just never gets indexed. It happened once with /live, so this
 * compares the sitemap against the actual route tree.
 */
describe("sitemap", () => {
  const appDir = join(process.cwd(), "src", "app");

  const routeDirs = readdirSync(appDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    // `api` has no pages; bracketed names are dynamic segments, covered by the
    // per-lesson and per-track entries rather than as a literal path.
    .filter((e) => e.name !== "api" && !e.name.startsWith("[") && !e.name.startsWith("_"))
    .filter((e) => existsSync(join(appDir, e.name, "page.tsx")))
    .map((e) => `/${e.name}`);

  it("covers every top-level page route", () => {
    const listed = new Set<string>(SITEMAP_ROUTES.map((r) => r.path));
    const excluded = new Set<string>(SITEMAP_EXCLUDED);

    for (const route of routeDirs) {
      assert.ok(
        listed.has(route) || excluded.has(route),
        `${route} has a page.tsx but is neither in SITEMAP_ROUTES nor SITEMAP_EXCLUDED`,
      );
    }
  });

  it("lists no route that doesn't exist", () => {
    for (const { path } of SITEMAP_ROUTES) {
      if (path === "") continue;
      assert.ok(routeDirs.includes(path), `sitemap lists ${path}, which has no page`);
    }
  });

  it("emits absolute urls for every track and lesson", () => {
    const urls = sitemap().map((e) => e.url);
    assert.equal(urls.length, SITEMAP_ROUTES.length + ORDERED_TRACKS.length + ALL_LESSONS.length);
    for (const url of urls) assert.match(url, /^https?:\/\//);
    assert.equal(new Set(urls).size, urls.length, "duplicate url in sitemap");
  });

  it("keeps the personal progress view out, matching robots.txt", () => {
    assert.ok(!sitemap().some((e) => e.url.endsWith("/dashboard")));
  });
});
