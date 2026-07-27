/**
 * Content model for MarketLab courses.
 *
 * Lessons are structured block trees rather than raw markdown/MDX. Three
 * reasons this earns its keep:
 *   1. Glossary terms are linked contextually from inside prose via `[[term]]`
 *      markup, resolved at render time against the single glossary source.
 *   2. Charts are first-class blocks — a lesson can drop a generated,
 *      annotated candlestick chart inline, which is the whole point of a
 *      chart-reading course.
 *   3. TypeScript catches a broken exercise id or malformed quiz at build time
 *      instead of shipping a dead lesson.
 */

import type { ChartSpec } from "@/lib/market/types";

/** Inline text supports: **bold**, *italic*, `code`, [[glossary-term]],
 *  [[term|display text]], [label](https://url), and ^up^ / ^down^ for
 *  semantically coloured price language. */
export type RichText = string;

export type Block =
  | { type: "p"; text: RichText }
  | { type: "h"; level: 2 | 3; text: RichText }
  | { type: "list"; ordered?: boolean; items: RichText[] }
  | {
      type: "callout";
      variant: "key" | "warn" | "note" | "desk" | "myth";
      title?: string;
      body: RichText[];
    }
  | {
      type: "table";
      caption?: string;
      headers: string[];
      rows: RichText[][];
      /** Right-align numeric columns and use tabular figures. */
      numericFrom?: number;
    }
  | { type: "chart"; spec: ChartSpec; caption?: RichText }
  | {
      type: "cards";
      columns?: 2 | 3;
      items: { title: string; subtitle?: string; body?: RichText; bullets?: RichText[] }[];
    }
  | { type: "steps"; items: { title: string; body: RichText }[] }
  | {
      type: "worked";
      title: string;
      /** Label / value rows — used for position sizing maths and similar. */
      rows: { label: RichText; value: RichText; emphasis?: boolean }[];
      note?: RichText;
    }
  | { type: "formula"; expr: string; note?: RichText }
  | {
      type: "story";
      title: string;
      /** Beat-by-beat scenario walkthrough. `verdict` closes it out. */
      beats: { label: string; text: RichText }[];
      verdict?: RichText;
    }
  | { type: "checklist"; title?: string; items: RichText[] }
  | { type: "exercise"; exerciseId: string; intro?: RichText }
  | { type: "divider" };

export interface QuizQuestion {
  /** Stable within its lesson. */
  id: string;
  prompt: RichText;
  options: RichText[];
  /** Index into `options`. */
  answer: number;
  /** Shown after answering, right or wrong. Teach here, don't just confirm. */
  explain: RichText;
}

export interface Lesson {
  /** Globally unique across the site — used as the progress-store key and as
   *  the URL segment under /learn/[track]/[lesson]. */
  slug: string;
  title: string;
  subtitle?: string;
  /** Rough read time in minutes, shown in the sidebar. */
  minutes: number;
  blocks: Block[];
  quiz: QuizQuestion[];
}

export interface Module {
  slug: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface Track {
  slug: string;
  title: string;
  /** One line, appears on cards and the landing map. */
  tagline: string;
  /** A paragraph, appears on the track page header. */
  description: string;
  /** Lucide-ish key resolved by <TrackIcon>. */
  icon: "foundations" | "charts" | "strategy" | "risk" | "macro" | "path";
  /** Reading order on the landing map. */
  order: number;
  /** Shown as a difficulty hint. */
  level: "Start here" | "Core" | "Advanced" | "Closing";
  modules: Module[];
}

export interface LessonRef {
  track: Track;
  module: Module;
  lesson: Lesson;
  /** 0-based position in the flattened site-wide lesson order. */
  index: number;
}
