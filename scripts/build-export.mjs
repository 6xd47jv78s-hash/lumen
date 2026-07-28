#!/usr/bin/env node
/**
 * Static-export build.
 *
 * The API routes under `src/app/api` are `force-dynamic` — they proxy live
 * market data and read server-side keys, so they cannot be prerendered. Next
 * refuses outright:
 *
 *   Error: export const dynamic = "force-dynamic" on page "/api/..." cannot be
 *   used with "output: export"
 *
 * There is no config switch to exclude an app route from a build, and private
 * folders (`_name`) are excluded from routing in *every* mode, which would
 * break the server build too. So this moves the directory aside for the
 * duration of the export and puts it back afterwards — including on failure and
 * on Ctrl-C, because leaving a repo with its API routes renamed would be a
 * genuinely confusing thing to walk into.
 *
 * The result is one codebase that targets both a Node host (Vercel, with live
 * stock data behind private keys) and a static file host (GitHub Pages, with
 * the keyless providers called straight from the browser).
 */

import { spawnSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { join } from "node:path";

const API_DIR = join(process.cwd(), "src", "app", "api");
// Must live OUTSIDE src/app: Next scans that whole tree for routes, so a
// parked copy inside it is still collected and still fails the build.
const PARKED = join(process.cwd(), "src", ".api-parked");

let parked = false;

function park() {
  if (!existsSync(API_DIR)) return;
  if (existsSync(PARKED)) {
    console.error(
      `\n${PARKED} already exists — a previous export build was interrupted.\n` +
        `Move it back to src/app/api before continuing.\n`,
    );
    process.exit(1);
  }
  renameSync(API_DIR, PARKED);
  parked = true;
}

function restore() {
  if (!parked) return;
  parked = false;
  if (existsSync(PARKED)) renameSync(PARKED, API_DIR);
}

// Cover every exit path, not just the happy one.
process.on("exit", restore);
process.on("SIGINT", () => {
  restore();
  process.exit(130);
});
process.on("SIGTERM", () => {
  restore();
  process.exit(143);
});
process.on("uncaughtException", (err) => {
  restore();
  console.error(err);
  process.exit(1);
});

park();

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_OUTPUT: "export" },
});

restore();
process.exit(result.status ?? 1);
