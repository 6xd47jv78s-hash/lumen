import type { Metadata } from "next";
import { TrackCard } from "@/components/layout/TrackCard";
import {
  ORDERED_TRACKS,
  TOTAL_LESSONS,
  TOTAL_MINUTES,
  trackLessons,
} from "@/lib/content/registry";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Six tracks covering market foundations, chart reading, strategy, risk and psychology, macro literacy, and how to practise for real.",
};

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 lg:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">Curriculum</p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink">Courses</h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
          Work through the tracks in order — each one assumes the last. Every lesson ends with a
          short knowledge check that unlocks the next one, so you can&rsquo;t accidentally build on
          something you skimmed.
        </p>
        <p className="mt-4 font-mono text-2xs text-faint tnum">
          {TOTAL_LESSONS} lessons · {Math.round(TOTAL_MINUTES / 60)} hours · free, no account
        </p>
      </header>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORDERED_TRACKS.map((track) => {
          const lessons = trackLessons(track);
          return (
            <TrackCard
              key={track.slug}
              track={track}
              lessonSlugs={lessons.map((l) => l.slug)}
              minutes={lessons.reduce((a, l) => a + l.minutes, 0)}
            />
          );
        })}
      </div>
    </div>
  );
}
