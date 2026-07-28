/**
 * Two build modes.
 *
 * Default: a normal Next server build (`next build` + `next start`). This is
 * what `npm run audit:site` drives, and what a Node host or Vercel would run.
 *
 * `NEXT_OUTPUT=export`: a fully static site in `out/`, for GitHub Pages or any
 * plain file host. The app has no backend, so nothing is lost — but `next start`
 * doesn't work against an export, which is why this is opt-in rather than the
 * default.
 *
 * `NEXT_BASE_PATH` handles project-style hosting where the site lives under a
 * subdirectory (github.io/<repo>) rather than at a domain root.
 */
const isExport = process.env.NEXT_OUTPUT === "export";
const basePath = process.env.NEXT_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(basePath ? { basePath } : {}),
  ...(isExport
    ? {
        output: "export",
        // Static hosts can't run the image optimiser.
        images: { unoptimized: true },
        // Emit `about/index.html` rather than `about.html`, which is what static
        // hosts need to serve clean URLs without redirect rules.
        trailingSlash: true,
      }
    : {}),
  env: {
    // Exposed so client code can prefix absolute asset paths it builds by hand
    // (next/link and next/image handle basePath themselves).
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
