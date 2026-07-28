import type { Block, Lesson } from "./types";

/**
 * Stable anchor for a section heading.
 *
 * Derived from the heading's plain text, so the inline markup a heading may
 * contain (`[[term]]`, `**bold**`) never leaks into the URL fragment.
 */
export function headingId(text: string): string {
  return text
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1")
    .replace(/[*`^]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface LessonSection {
  id: string;
  text: string;
}

/** The h2s of a lesson, in order — the contents of the "on this page" rail. */
export function lessonSections(lesson: Lesson): LessonSection[] {
  return lesson.blocks
    .filter((b): b is Extract<Block, { type: "h" }> => b.type === "h" && b.level === 2)
    .map((b) => ({
      id: headingId(b.text),
      // The rail is a compact list, so strip markup rather than render it.
      text: b.text.replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1").replace(/[*`]/g, ""),
    }));
}
