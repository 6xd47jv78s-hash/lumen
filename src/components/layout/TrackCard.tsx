"use client";

import Link from "next/link";
import type { Track } from "@/lib/content/types";
import { useProgress } from "@/store/progress";
import { TrackIcon } from "./TrackIcon";

export function TrackCard({
  track,
  lessonSlugs,
  minutes,
}: {
  track: Track;
  lessonSlugs: string[];
  minutes: number;
}) {
  const lessons = useProgress((s) => s.lessons);
  const hydrated = useProgress((s) => s.hydrated);
  const done = hydrated ? lessonSlugs.filter((s) => lessons[s]).length : 0;
  const pct = lessonSlugs.length ? Math.round((done / lessonSlugs.length) * 100) : 0;

  return (
    <Link
      href={`/learn/${track.slug}`}
      className="group flex flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-raised/60"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line-strong bg-raised text-accent transition-colors group-hover:border-accent/50">
          <TrackIcon icon={track.icon} />
        </span>
        <span className="eyebrow">{track.level}</span>
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">{track.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{track.tagline}</p>

      <div className="mt-4 flex items-center gap-2 font-mono text-2xs text-faint">
        <span className="tnum">{lessonSlugs.length} lessons</span>
        <span aria-hidden>·</span>
        <span className="tnum">{minutes} min</span>
        {done > 0 && (
          <span className={`ml-auto tnum ${pct === 100 ? "text-up" : "text-accent"}`}>
            {pct === 100 ? "complete" : `${pct}%`}
          </span>
        )}
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct === 100 ? "bg-up" : "bg-accent"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  );
}
