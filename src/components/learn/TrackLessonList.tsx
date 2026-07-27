"use client";

import Link from "next/link";
import type { Track } from "@/lib/content/types";
import { useProgress } from "@/store/progress";

export function TrackLessonList({ track }: { track: Track }) {
  const lessons = useProgress((s) => s.lessons);
  const hydrated = useProgress((s) => s.hydrated);

  const all = track.modules.flatMap((m) => m.lessons);
  const done = hydrated ? all.filter((l) => lessons[l.slug]).length : 0;
  const pct = Math.round((done / all.length) * 100);
  const resume = all.find((l) => !lessons[l.slug]) ?? all[0];

  return (
    <>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link href={`/learn/${track.slug}/${resume.slug}`} className="btn-primary">
          {done === 0 ? "Start track" : done === all.length ? "Review track" : "Continue"}
        </Link>
        {hydrated && done > 0 && (
          <div className="flex min-w-[12rem] flex-1 items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pct === 100 ? "bg-up" : "bg-accent"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-2xs text-muted tnum">
              {done}/{all.length}
            </span>
          </div>
        )}
      </div>

      <div className="mt-9 space-y-9">
        {track.modules.map((module, mi) => (
          <section key={module.slug}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xs text-faint tnum">
                {String(mi + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-base font-semibold tracking-tight text-ink">{module.title}</h2>
                <p className="mt-0.5 text-sm text-muted">{module.summary}</p>
              </div>
            </div>

            <ol className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
              {module.lessons.map((lesson, li) => {
                const complete = hydrated && lessons[lesson.slug];
                return (
                  <li key={lesson.slug}>
                    <Link
                      href={`/learn/${track.slug}/${lesson.slug}`}
                      className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-raised/60"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-2xs tnum ${
                          complete
                            ? "border-up bg-up/15 text-up"
                            : "border-line-strong text-faint"
                        }`}
                        aria-hidden
                      >
                        {complete ? "✓" : li + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{lesson.title}</p>
                        {lesson.subtitle && (
                          <p className="mt-0.5 truncate text-xs text-faint">{lesson.subtitle}</p>
                        )}
                      </div>
                      <span className="shrink-0 font-mono text-2xs text-faint tnum">
                        {complete
                          ? `${lessons[lesson.slug].score}/${lessons[lesson.slug].total}`
                          : `${lesson.minutes}m`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
