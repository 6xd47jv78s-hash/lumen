#!/usr/bin/env node
/**
 * Rendered-site audit.
 *
 * `audit-content` checks the source; this checks what actually ships. It builds
 * nothing — run `npm run build` first — then starts the production server,
 * crawls every internally-linked page, and checks the delivered HTML for broken
 * links and the accessibility mistakes that are easy to make and invisible to
 * review: unnamed controls, undecorated icons, skipped heading levels,
 * unlabelled inputs, missing page metadata.
 *
 * Deliberately dependency-free — regex over the response body rather than a
 * headless browser — so it runs in CI without a browser download. The trade-off
 * is that it only sees server-rendered markup, and can't measure layout. Client
 * -only affordances and horizontal overflow need a real browser.
 *
 * Run with: npm run audit:site
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const PORT = Number(process.env.AUDIT_PORT ?? 3999);
const BASE = `http://localhost:${PORT}`;
const START_TIMEOUT_MS = 60_000;

/* ------------------------------------------------------------------ boot --- */

const NEXT_BIN = join(process.cwd(), "node_modules", ".bin", "next");
if (!existsSync(join(process.cwd(), ".next", "BUILD_ID"))) {
  console.error("No production build found. Run `npm run build` first.\n");
  process.exit(1);
}

/**
 * Refuse to run against something already on the port. Next would fail to bind
 * and fall back to another port, we'd connect to the stranger, and the audit
 * would silently pass against a stale build — the worst possible outcome for a
 * check whose whole job is to be trusted.
 */
{
  let occupied = false;
  try {
    await fetch(BASE + "/", { signal: AbortSignal.timeout(1500) });
    occupied = true;
  } catch {
    /* nothing listening, which is what we want */
  }
  if (occupied) {
    console.error(
      `Port ${PORT} is already in use. Stop that process, or set AUDIT_PORT to a free port.\n`,
    );
    process.exit(1);
  }
}

/**
 * Spawn the binary directly rather than through `npx`, and in its own process
 * group. Going through a wrapper means the PID we can kill isn't the server —
 * the real one survives, its pipes keep our event loop alive, and the script
 * prints its report and then hangs forever.
 */
const server = spawn(NEXT_BIN, ["start", "-p", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
  env: { ...process.env, NO_PROXY: "localhost,127.0.0.1" },
});

let serverLog = "";
server.stdout.on("data", (d) => (serverLog += d));
server.stderr.on("data", (d) => (serverLog += d));

let stopped = false;
function shutdown() {
  if (stopped) return;
  stopped = true;
  try {
    // Negative pid signals the whole group, so no orphan is left on the port.
    process.kill(-server.pid, "SIGTERM");
  } catch {
    /* already gone */
  }
}

/** Report, clean up, and leave — never linger on a stray handle. */
function finish(code) {
  shutdown();
  process.exit(code);
}

process.on("SIGINT", () => finish(130));
process.on("SIGTERM", () => finish(143));

async function waitForServer() {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE + "/", { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.error(`Server did not start within ${START_TIMEOUT_MS / 1000}s.\n${serverLog}`);
  finish(1);
}

/** Progress goes to stderr, which stays line-buffered when stdout is piped. */
function progress(msg) {
  process.stderr.write(`  ${msg}\n`);
}

/* ------------------------------------------------------------- html checks --- */

/** Strip out anything that shouldn't be parsed as page markup. */
function stripNoise(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function textOf(fragment) {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function checkPage(path, html) {
  const issues = [];
  const body = stripNoise(html);

  // --- metadata -------------------------------------------------------------
  if (!/<title>[^<]{5,}<\/title>/i.test(html)) issues.push("missing or empty <title>");
  if (!/<meta[^>]+name="description"[^>]+content="[^"]{20,}"/i.test(html)) {
    issues.push("missing meta description");
  }
  if (!/<html[^>]+lang="/i.test(html)) issues.push("<html> has no lang attribute");

  // --- headings -------------------------------------------------------------
  const headings = [...body.matchAll(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const h1s = headings.filter((h) => h[1] === "1");
  if (h1s.length !== 1) issues.push(`h1 count = ${h1s.length}`);

  let prev = 0;
  for (const h of headings) {
    const level = Number(h[1]);
    if (prev && level > prev + 1) {
      issues.push(`heading jump h${prev}→h${level}: "${textOf(h[2]).slice(0, 45)}"`);
    }
    if (!textOf(h[2])) issues.push(`empty h${level}`);
    prev = level;
  }

  // --- interactive elements need an accessible name -------------------------
  for (const [full, attrs, inner] of body.matchAll(
    /<(?:a|button)\b([^>]*)>([\s\S]*?)<\/(?:a|button)>/gi,
  )) {
    void full;
    const hasLabel = /\baria-label="[^"]+"|\btitle="[^"]+"|\baria-labelledby="/i.test(attrs);
    if (!hasLabel && !textOf(inner)) {
      issues.push(`unnamed control: ${attrs.trim().slice(0, 60)}`);
    }
  }

  // --- images ---------------------------------------------------------------
  for (const [, attrs] of body.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt=/i.test(attrs)) issues.push(`<img> without alt: ${attrs.trim().slice(0, 50)}`);
  }

  // --- decorative svg must be hidden from assistive tech --------------------
  for (const [, attrs] of body.matchAll(/<svg\b([^>]*)>/gi)) {
    const hidden = /\baria-hidden(\s|=|>)/i.test(attrs);
    const labelled = /\brole="img"/i.test(attrs) && /\baria-label="/i.test(attrs);
    if (!hidden && !labelled) {
      issues.push(`svg neither aria-hidden nor role="img"+aria-label`);
    }
  }

  // --- form controls need a label -------------------------------------------
  const labelFor = new Set(
    [...body.matchAll(/<label\b[^>]*\bfor="([^"]+)"/gi)].map((m) => m[1]),
  );
  for (const [, tag, attrs] of body.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    if (/\btype="(hidden|submit|button)"/i.test(attrs)) continue;
    const id = attrs.match(/\bid="([^"]+)"/i)?.[1];
    const named =
      /\baria-label="[^"]+"|\baria-labelledby="/i.test(attrs) || (id && labelFor.has(id));
    if (!named) issues.push(`unlabelled <${tag}>: ${attrs.trim().slice(0, 50)}`);
  }

  // --- link hygiene ---------------------------------------------------------
  for (const [, attrs] of body.matchAll(/<a\b([^>]*)>/gi)) {
    if (/\btarget="_blank"/i.test(attrs) && !/\brel="[^"]*noopener/i.test(attrs)) {
      issues.push(`target="_blank" without rel="noopener"`);
    }
  }

  return issues;
}

function internalLinks(html) {
  return [...stripNoise(html).matchAll(/<a\b[^>]*\bhref="(\/[^"#]*)"/gi)]
    .map((m) => m[1])
    .map((h) => (h.length > 1 ? h.replace(/\/$/, "") : h));
}

/* -------------------------------------------------------------------- run --- */

const startedAt = Date.now();
await waitForServer();
progress(`server ready on ${BASE}`);

const seen = new Map();
const queue = ["/"];
const broken = [];
const issues = [];

while (queue.length) {
  if (seen.size && seen.size % 15 === 0 && !seen.has(queue[0])) {
    progress(`${seen.size} pages crawled, ${queue.length} queued`);
  }
  const path = queue.shift();
  if (seen.has(path)) continue;

  let res;
  try {
    res = await fetch(BASE + path, { signal: AbortSignal.timeout(15_000) });
  } catch (err) {
    broken.push(`${path} → request failed: ${err.message}`);
    seen.set(path, 0);
    continue;
  }

  seen.set(path, res.status);
  if (!res.ok) {
    broken.push(`${path} → HTTP ${res.status}`);
    continue;
  }
  if (!(res.headers.get("content-type") ?? "").includes("text/html")) continue;

  const html = await res.text();
  for (const issue of checkPage(path, html)) issues.push({ path, issue });
  for (const link of internalLinks(html)) if (!seen.has(link)) queue.push(link);
}

/* ----------------------------------------------------------------- report --- */

shutdown();

console.log(
  `\nCrawled ${seen.size} pages on ${BASE} in ${((Date.now() - startedAt) / 1000).toFixed(1)}s\n`,
);

// Group by issue text so a nav-wide problem reads as one finding, not 45.
const grouped = new Map();
for (const { path, issue } of issues) {
  if (!grouped.has(issue)) grouped.set(issue, []);
  grouped.get(issue).push(path);
}

if (broken.length) {
  console.error(`  BROKEN LINKS (${broken.length}):`);
  for (const b of broken) console.error(`    ${b}`);
  console.error("");
}

if (grouped.size) {
  console.error(`  ACCESSIBILITY / MARKUP (${grouped.size} distinct, ${issues.length} total):`);
  for (const [issue, paths] of grouped) {
    const where = paths.length > 3 ? `${paths.length} pages` : paths.join(", ");
    console.error(`    ${issue}  —  ${where}`);
  }
  console.error("");
}

if (broken.length || grouped.size) {
  console.error("Site audit failed.\n");
  finish(1);
}

console.log("  No broken links. No markup or accessibility findings.");
console.log("  (Layout and client-only behaviour still need a browser pass.)\n");
finish(0);
