"use client";

import Link from "next/link";
import { useProgress } from "@/store/progress";

export interface LessonStub {
  slug: string;
  title: string;
  track: string;
  trackSlug: string;
  minutes: number;
}

/**
 * Returning-user strip. Renders nothing for a first-time visitor rather than
 * showing an empty "0 of 34" state, which reads as homework not yet done.
 */
export function ContinueBar({ ordered }: { ordered: LessonStub[] }) {
  const hydrated = useProgress((s) => s.hydrated);
  const lessons = useProgress((s) => s.lessons);
  const streak = useProgress((s) => s.streak);

  if (!hydrated) return null;
  const doneCount = ordered.filter((l) => lessons[l.slug]).length;
  if (doneCount === 0) return null;

  const next = ordered.find((l) => !lessons[l.slug]);
  const pct = Math.round((doneCount / ordered.length) * 100);

  return (
    <div className="mx-auto mt-10 max-w-[86rem] px-4 sm:px-6">
      <div className="flex flex-col gap-4 rounded-lg border border-accent/35 bg-accent-soft/45 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-accent">Welcome back</p>
          <p className="mt-1.5 text-sm text-ink">
            {next ? (
              <>
                Next up: <span className="font-semibold">{next.title}</span>{" "}
                <span className="text-muted">— {next.track}</span>
              </>
            ) : (
              <span className="font-semibold">
                You&rsquo;ve finished every lesson. Go stress-test it in Practice.
              </span>
            )}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <span className="shrink-0 font-mono text-2xs text-muted tnum">
              {doneCount}/{ordered.length}
              {streak > 1 && <span className="ml-2 text-signal">▲ {streak}d</span>}
            </span>
          </div>
        </div>
        <Link
          href={next ? `/learn/${next.trackSlug}/${next.slug}` : "/practice"}
          className="btn-primary shrink-0"
        >
          {next ? "Continue" : "Open practice"}
        </Link>
      </div>
    </div>
  );
}
