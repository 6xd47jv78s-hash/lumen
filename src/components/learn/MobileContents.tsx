"use client";

import Link from "next/link";
import { useState } from "react";
import type { Track } from "@/lib/content/types";
import { useProgress } from "@/store/progress";

/**
 * Track contents on small screens, where the sidebar rail is hidden. Collapsed
 * by default so it never pushes the lesson itself below the fold.
 */
export function MobileContents({ track, current }: { track: Track; current: string }) {
  const [open, setOpen] = useState(false);
  const lessons = useProgress((s) => s.lessons);
  const hydrated = useProgress((s) => s.hydrated);

  const all = track.modules.flatMap((m) => m.lessons);
  const done = hydrated ? all.filter((l) => lessons[l.slug]).length : 0;
  const position = all.findIndex((l) => l.slug === current) + 1;

  return (
    <div className="mb-6 rounded-lg border border-line bg-surface lg:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="eyebrow block">{track.title}</span>
          <span className="mt-0.5 block text-xs text-muted tnum">
            Lesson {position} of {all.length} in this track
            {done > 0 && ` · ${done} complete`}
          </span>
        </span>
        <span className="text-sm text-accent">{open ? "Hide" : "Contents"}</span>
        <span aria-hidden className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}>
          ↓
        </span>
      </button>

      {open && (
        <div className="animate-fade-up space-y-4 border-t border-line px-4 py-3">
          {track.modules.map((mod) => (
            <div key={mod.slug}>
              <p className="text-2xs font-semibold uppercase tracking-wider text-faint">
                {mod.title}
              </p>
              <ul className="mt-1.5 space-y-px">
                {mod.lessons.map((lesson) => {
                  const active = lesson.slug === current;
                  const complete = hydrated && !!lessons[lesson.slug];
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={`/learn/${track.slug}/${lesson.slug}`}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-start gap-2 rounded py-1.5 text-sm leading-snug ${
                          active ? "font-medium text-ink" : "text-muted"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`mt-[0.3rem] h-2 w-2 shrink-0 rounded-full border ${
                            complete
                              ? "border-up bg-up"
                              : active
                                ? "border-accent"
                                : "border-line-strong"
                          }`}
                        />
                        {lesson.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
