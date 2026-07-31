import { EXERCISES } from "@/content/exercises";
import { GLOSSARY, slugifyTerm } from "@/content/glossary";
import { ALL_LESSONS, ORDERED_TRACKS } from "./registry";
import { lessonSections } from "./headings";

export type SearchKind = "lesson" | "term" | "exercise" | "track" | "page";

export interface SearchDoc {
  id: string;
  kind: SearchKind;
  /** Primary label. Matches here score highest. */
  title: string;
  /** One line of context under the title — never used for matching alone. */
  context: string;
  href: string;
  /**
   * Secondary text that should match but not display: section headings, aliases,
   * a lesson's subtitle. Lower-cased once at build time so search doesn't redo
   * it on every keystroke.
   */
  terms: string[];
}

/** Weight by kind, applied after the text score, to break ties sensibly. */
const KIND_WEIGHT: Record<SearchKind, number> = {
  lesson: 1,
  term: 0.95,
  track: 0.9,
  exercise: 0.85,
  page: 0.8,
};

const STATIC_PAGES: { title: string; context: string; href: string; terms: string[] }[] = [
  {
    title: "Chart practice",
    context: "Interactive exercises scored against a model answer",
    href: "/practice",
    terms: ["exercises", "drills", "interactive", "scored"],
  },
  {
    title: "Live markets",
    context: "Real crypto, FX and stock charts with a headline wire",
    href: "/live",
    terms: ["real time", "prices", "bitcoin", "wire", "live data"],
  },
  {
    title: "Market Watch",
    context: "Countdowns to the scheduled events that move markets",
    href: "/watch",
    terms: ["calendar", "economic events", "cpi", "fomc", "earnings", "alerts"],
  },
  {
    title: "Market news",
    context: "Headlines paired with the mechanism that connects them to prices",
    href: "/news",
    terms: ["stories", "headlines", "why it matters"],
  },
  {
    title: "Glossary",
    context: "Every term the course uses, defined",
    href: "/glossary",
    terms: ["definitions", "jargon", "dictionary", "terms"],
  },
  {
    title: "Your progress",
    context: "Lessons completed, quiz accuracy, streak and practice scores",
    href: "/dashboard",
    terms: ["dashboard", "streak", "stats", "score"],
  },
];

/**
 * Everything searchable on the site, built once at module load.
 *
 * Deliberately indexes titles, subtitles and section headings rather than full
 * lesson prose. Full-text would multiply the payload for a worse result: at 800
 * words a lesson matches nearly any common word, so every query would return
 * most of the course. Headings are what a reader is actually trying to find.
 */
export const SEARCH_INDEX: SearchDoc[] = [
  ...ALL_LESSONS.map(({ track, module, lesson }) => ({
    id: `lesson:${lesson.slug}`,
    kind: "lesson" as const,
    title: lesson.title,
    context: `${track.title} · ${module.title}`,
    href: `/learn/${track.slug}/${lesson.slug}`,
    terms: [
      lesson.subtitle ?? "",
      track.title,
      module.title,
      ...lessonSections(lesson).map((s) => s.text),
    ]
      .filter(Boolean)
      .map((t) => t.toLowerCase()),
  })),

  ...ORDERED_TRACKS.map((track) => ({
    id: `track:${track.slug}`,
    kind: "track" as const,
    title: track.title,
    context: `Track · ${track.modules.length} modules`,
    href: `/learn/${track.slug}`,
    terms: [track.tagline, ...track.modules.map((m) => m.title)].map((t) => t.toLowerCase()),
  })),

  ...GLOSSARY.map((entry) => ({
    id: `term:${entry.term}`,
    kind: "term" as const,
    title: entry.term,
    context: entry.definition,
    href: `/glossary#${slugifyTerm(entry.term)}`,
    terms: [entry.category, ...(entry.aliases ?? [])].map((t) => t.toLowerCase()),
  })),

  ...EXERCISES.map((ex) => ({
    id: `exercise:${ex.id}`,
    kind: "exercise" as const,
    title: ex.title,
    context: `Exercise · ${ex.mode}`,
    href: `/practice#${ex.id}`,
    terms: [ex.mode, ex.brief].map((t) => t.toLowerCase()),
  })),

  ...STATIC_PAGES.map((p) => ({
    id: `page:${p.href}`,
    kind: "page" as const,
    title: p.title,
    context: p.context,
    href: p.href,
    terms: p.terms.map((t) => t.toLowerCase()),
  })),
];

/** Lower-cased titles, cached so scoring doesn't re-lower on every keystroke. */
const TITLES = SEARCH_INDEX.map((d) => d.title.toLowerCase());

export interface SearchHit {
  doc: SearchDoc;
  score: number;
}

interface Token {
  text: string;
  /** Matches the token at the start of any word. */
  boundary: RegExp;
}

/**
 * Scores one document against the parsed query.
 *
 * Ranking is ordinal rather than fuzzy on purpose: a student searching "stop
 * loss" should get the stop-loss lesson first, every time, not whichever entry
 * an edit-distance metric happens to favour today. Every query token must
 * appear somewhere, so adding a word always narrows.
 *
 * Matching is anchored to word starts — never a bare substring. Allowing
 * substrings anywhere meant "rsi" ranked *Loss ave-rsi-on* and *mean reve-rsi-on*
 * as hits, which is exactly the sort of nonsense that makes people stop
 * trusting a search box. Typing a prefix of a word still works, because a
 * prefix starts at a word boundary by definition.
 */
function score(index: number, tokens: Token[]): number {
  const doc = SEARCH_INDEX[index];
  const title = TITLES[index];
  let total = 0;

  for (const token of tokens) {
    let best = 0;
    if (title === token.text) best = 12;
    else if (title.startsWith(token.text)) best = 8;
    else if (token.boundary.test(title)) best = 6;

    if (best < 6) {
      for (const term of doc.terms) {
        if (term.startsWith(token.text)) best = Math.max(best, 4);
        else if (token.boundary.test(term)) best = Math.max(best, 2.5);
      }
    }

    // Every token has to land somewhere, or the document is not a match at all.
    if (best === 0) return 0;
    total += best;
  }

  return total * KIND_WEIGHT[doc.kind];
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function search(query: string, limit = 8): SearchHit[] {
  // Built once per query rather than per document — this runs on every
  // keystroke across 185 documents.
  const tokens: Token[] = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, boundary: new RegExp(`\\b${escapeRe(text)}`) }));
  if (!tokens.length) return [];

  const hits: SearchHit[] = [];
  for (let i = 0; i < SEARCH_INDEX.length; i++) {
    const s = score(i, tokens);
    if (s > 0) hits.push({ doc: SEARCH_INDEX[i], score: s });
  }

  // Ties broken by title length: the shorter title is the more specific match
  // for the same score ("Volume" over "Volume: reading participation").
  hits.sort((a, b) => b.score - a.score || a.doc.title.length - b.doc.title.length);
  return hits.slice(0, limit);
}
