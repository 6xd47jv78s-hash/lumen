"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Track } from "@/lib/content/types";
import { useProgress } from "@/store/progress";

/**
 * Track contents rail. Also the place that records the visit, so the "continue
 * where you left off" affordance works even if a student never finishes the quiz.
 */
export function LessonSidebar({ track, current }: { track: Track; current: string }) {
  const lessons = useProgress((s) => s.lessons);
  const hydrated = useProgress((s) => s.hydrated);
  const setLast = useProgress((s) => s.setLastLesson);
  const touch = useProgress((s) => s.touch);

  useEffect(() => {
    setLast(current);
    touch();
  }, [current, setLast, touch]);

  return (
    <nav aria-label="Track contents" className="text-sm">
      <Link
        href={`/learn/${track.slug}`}
        className="eyebrow block transition-colors hover:text-accent"
      >
        ← {track.title}
      </Link>

      <div className="mt-4 space-y-5">
        {track.modules.map((module) => (
          <div key={module.slug}>
            <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-faint">
              {module.title}
            </p>
            <ul className="space-y-px border-l border-line">
              {module.lessons.map((lesson) => {
                const active = lesson.slug === current;
                const done = hydrated && !!lessons[lesson.slug];
                return (
                  <li key={lesson.slug}>
                    <Link
                      href={`/learn/${track.slug}/${lesson.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={`-ml-px flex items-start gap-2 border-l-2 py-1.5 pl-3 pr-2 leading-snug transition-colors ${
                        active
                          ? "border-accent font-medium text-ink"
                          : "border-transparent text-muted hover:border-line-strong hover:text-ink"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`mt-[0.28rem] h-2 w-2 shrink-0 rounded-full border ${
                          done
                            ? "border-up bg-up"
                            : active
                              ? "border-accent"
                              : "border-line-strong"
                        }`}
                      />
                      <span className="min-w-0">{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
