import { TRACKS } from "@/content/tracks";
import type { Lesson, LessonRef, Track } from "./types";

export { TRACKS };

/** Site-wide lesson order: tracks by `order`, then module and lesson order. */
export const ALL_LESSONS: LessonRef[] = (() => {
  const out: LessonRef[] = [];
  let i = 0;
  for (const track of [...TRACKS].sort((a, b) => a.order - b.order)) {
    for (const mod of track.modules) {
      for (const lesson of mod.lessons) {
        out.push({ track, module: mod, lesson, index: i++ });
      }
    }
  }
  return out;
})();

const BY_SLUG = new Map(ALL_LESSONS.map((l) => [l.lesson.slug, l]));

export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

export function getLessonRef(slug: string): LessonRef | undefined {
  return BY_SLUG.get(slug);
}

export function trackLessons(track: Track): Lesson[] {
  return track.modules.flatMap((m) => m.lessons);
}

export function lessonCount(track: Track): number {
  return trackLessons(track).length;
}

export function neighbours(slug: string): { prev?: LessonRef; next?: LessonRef } {
  const ref = BY_SLUG.get(slug);
  if (!ref) return {};
  return { prev: ALL_LESSONS[ref.index - 1], next: ALL_LESSONS[ref.index + 1] };
}

/** Total minutes of reading across the site — used on the landing page. */
export const TOTAL_MINUTES = ALL_LESSONS.reduce((a, l) => a + l.lesson.minutes, 0);
export const TOTAL_LESSONS = ALL_LESSONS.length;
export const TOTAL_QUESTIONS = ALL_LESSONS.reduce((a, l) => a + l.lesson.quiz.length, 0);

export const ORDERED_TRACKS = [...TRACKS].sort((a, b) => a.order - b.order);
