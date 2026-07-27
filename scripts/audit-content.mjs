#!/usr/bin/env node
/**
 * Content audit.
 *
 * The lesson content is prose, and prose drifts: a [[term]] gets renamed in the
 * glossary, an exercise id gets a typo, two lessons end up with the same slug.
 * None of those are type errors, and all of them ship a broken lesson. This
 * script catches them.
 *
 * Run with: npm run audit
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const TRACK_DIR = join(ROOT, "src/content/tracks");

const read = (p) => readFileSync(p, "utf8");
const problems = [];
const warn = [];

/* ------------------------------------------------------- glossary index --- */

const glossarySrc = read(join(ROOT, "src/content/glossary.ts"));
const known = new Set();

// Entries are written both multi-line and inline, so match anywhere.
for (const m of glossarySrc.matchAll(/\bterm:\s*"([^"]+)"/g)) {
  known.add(m[1].toLowerCase());
}
for (const m of glossarySrc.matchAll(/\baliases:\s*\[([^\]]+)\]/g)) {
  for (const a of m[1].matchAll(/"([^"]+)"/g)) known.add(a[1].toLowerCase());
}

if (known.size < 50) {
  problems.push(`Glossary parse looks wrong — only found ${known.size} terms.`);
}

/** Mirrors lookupTerm(): exact match, then a naive plural strip. */
const resolves = (term) => {
  const k = term.trim().toLowerCase();
  return known.has(k) || known.has(k.replace(/s$/, ""));
};

/* ----------------------------------------------------------- exercise ids --- */

const exerciseSrc = read(join(ROOT, "src/content/exercises.ts"));
const exerciseIds = new Set(
  [...exerciseSrc.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((m) => m[1]),
);

/* --------------------------------------------------------------- lessons --- */

const trackFiles = readdirSync(TRACK_DIR).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts",
);

const lessonSlugs = new Map();
let lessonCount = 0;
let termLinks = 0;

for (const file of trackFiles) {
  const src = read(join(TRACK_DIR, file));

  // Lesson slugs live at a known indentation inside the lessons array.
  for (const m of src.matchAll(/^\s{10}slug:\s*"([^"]+)"/gm)) {
    lessonCount++;
    const slug = m[1];
    if (lessonSlugs.has(slug)) {
      problems.push(
        `Duplicate lesson slug "${slug}" in ${file} and ${lessonSlugs.get(slug)}. ` +
          `Slugs must be globally unique — they are the progress key and the URL segment.`,
      );
    } else {
      lessonSlugs.set(slug, file);
    }
  }

  for (const m of src.matchAll(/\[\[([^\]]+)\]\]/g)) {
    termLinks++;
    const term = m[1].split("|")[0].trim();
    if (!resolves(term)) {
      problems.push(`${file}: [[${term}]] has no glossary entry.`);
    }
  }

  for (const m of src.matchAll(/exerciseId:\s*"([^"]+)"/g)) {
    if (!exerciseIds.has(m[1])) {
      problems.push(`${file}: exerciseId "${m[1]}" does not exist.`);
    }
  }

  // Every lesson should land a key takeaway.
  const keyCallouts = [...src.matchAll(/variant:\s*"key"/g)].length;
  const lessonsHere = [...src.matchAll(/^\s{10}slug:\s*"([^"]+)"/gm)].length;
  if (keyCallouts < lessonsHere) {
    warn.push(
      `${file}: ${lessonsHere} lessons but only ${keyCallouts} "key takeaway" callouts.`,
    );
  }
}

/* -------------------------------------------------- cross-file references --- */

// Anything that deep-links into a lesson must point at one that exists.
for (const file of ["src/content/news.ts", "src/content/events.ts"]) {
  const src = read(join(ROOT, file));
  for (const m of src.matchAll(/lesson:\s*\{\s*slug:\s*"([^"]+)"/g)) {
    if (!lessonSlugs.has(m[1])) {
      problems.push(`${file}: links to lesson "${m[1]}", which does not exist.`);
    }
  }
}

// Pages can link into lessons too — catch a renamed slug before it 404s.
const APP_DIR = join(ROOT, "src/app");
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
}
for (const file of walk(APP_DIR).filter((f) => f.endsWith(".tsx"))) {
  for (const m of read(file).matchAll(/href="\/learn\/[a-z-]+\/([a-z0-9-]+)"/g)) {
    if (!lessonSlugs.has(m[1])) {
      problems.push(
        `${file.replace(ROOT, "")}: links to /learn/.../${m[1]}, which is not a lesson.`,
      );
    }
  }
}

for (const m of exerciseSrc.matchAll(/\[\[([^\]]+)\]\]/g)) {
  const term = m[1].split("|")[0].trim();
  if (!resolves(term)) problems.push(`exercises.ts: [[${term}]] has no glossary entry.`);
}

const unusedExercises = [...exerciseIds].filter(
  (id) => !trackFiles.some((f) => read(join(TRACK_DIR, f)).includes(`"${id}"`)),
);
if (unusedExercises.length) {
  warn.push(
    `Exercises not embedded in any lesson (practice-tool only): ${unusedExercises.join(", ")}`,
  );
}

/* ---------------------------------------------------------------- report --- */

console.log(
  `\nAudited ${lessonCount} lessons · ${termLinks} glossary links · ` +
    `${known.size} terms · ${exerciseIds.size} exercises\n`,
);

for (const w of warn) console.log(`  note  ${w}`);
if (warn.length) console.log("");

if (problems.length) {
  for (const p of problems) console.error(`  FAIL  ${p}`);
  console.error(`\n${problems.length} problem(s) found.\n`);
  process.exit(1);
}

console.log("  All content references resolve.\n");
