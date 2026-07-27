"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ActivityChart, type WeekPoint } from "./ActivityChart";
import { MODE_LABEL, type Exercise } from "@/lib/exercise/types";
import { dayKey, useProgress } from "@/store/progress";

export interface TrackSummary {
  slug: string;
  title: string;
  level: string;
  lessons: { slug: string; title: string; minutes: number }[];
}

export function Dashboard({
  tracks,
  exercises,
  totalQuestions,
}: {
  tracks: TrackSummary[];
  exercises: Pick<Exercise, "id" | "mode" | "title">[];
  totalQuestions: number;
}) {
  const hydrated = useProgress((s) => s.hydrated);
  const lessons = useProgress((s) => s.lessons);
  const exerciseScores = useProgress((s) => s.exercises);
  const streak = useProgress((s) => s.streak);
  const longest = useProgress((s) => s.longestStreak);
  const activeDays = useProgress((s) => s.activeDays);
  const reset = useProgress((s) => s.reset);
  const [confirming, setConfirming] = useState(false);

  const allLessons = tracks.flatMap((t) => t.lessons);
  const done = allLessons.filter((l) => lessons[l.slug]);
  const pct = Math.round((done.length / allLessons.length) * 100);

  const scored = done.reduce(
    (acc, l) => {
      const r = lessons[l.slug];
      return { correct: acc.correct + r.score, total: acc.total + r.total };
    },
    { correct: 0, total: 0 },
  );
  const quizPct = scored.total ? Math.round((scored.correct / scored.total) * 100) : 0;

  const attempted = exercises.filter((e) => exerciseScores[e.id]);
  const perfect = attempted.filter((e) => exerciseScores[e.id].best === 100);

  const weeks = useMemo(() => buildWeeks(activeDays), [activeDays]);
  const next = allLessons.find((l) => !lessons[l.slug]);
  const minutesDone = done.reduce((a, l) => a + l.minutes, 0);

  if (!hydrated) {
    return (
      <div className="mt-8 rounded-lg border border-line bg-surface px-4 py-16 text-center">
        <span className="eyebrow animate-pulse">Loading your progress…</span>
      </div>
    );
  }

  if (done.length === 0 && attempted.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-line bg-surface px-6 py-14 text-center">
        <p className="eyebrow">Nothing here yet</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Your progress, quiz scores and practice results will appear here as you work through the
          course. Everything is stored locally in this browser — there&rsquo;s no account and
          nothing is uploaded.
        </p>
        <Link href="/learn/foundations/what-is-a-market" className="btn-primary mt-6">
          Start the first lesson
        </Link>
      </div>
    );
  }

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Lessons complete" value={`${done.length}`} sub={`of ${allLessons.length}`} />
        <Stat
          label="Quiz accuracy"
          value={scored.total ? `${quizPct}%` : "—"}
          sub={scored.total ? `${scored.correct} of ${scored.total} questions` : `${totalQuestions} available`}
          tone={quizPct >= 80 ? "up" : undefined}
        />
        <Stat
          label="Current streak"
          value={streak > 0 ? `${streak}d` : "—"}
          sub={longest > 0 ? `best ${longest}d` : "study on consecutive days"}
          tone={streak >= 3 ? "signal" : undefined}
        />
        <Stat
          label="Exercises mastered"
          value={`${perfect.length}`}
          sub={`${attempted.length} of ${exercises.length} attempted`}
        />
      </dl>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* ------------------------------------------------- track progress */}
        <section className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Course progress</h2>
            <span className="font-mono text-2xs text-faint tnum">
              {pct}% · {minutesDone} min read
            </span>
          </div>

          <div className="mt-4 space-y-3.5">
            {tracks.map((track) => {
              const complete = track.lessons.filter((l) => lessons[l.slug]).length;
              const p = Math.round((complete / track.lessons.length) * 100);
              return (
                <div key={track.slug}>
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/learn/${track.slug}`}
                      className="text-sm text-ink transition-colors hover:text-accent"
                    >
                      {track.title}
                    </Link>
                    <span className="shrink-0 font-mono text-2xs text-faint tnum">
                      {complete}/{track.lessons.length}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        p === 100 ? "bg-up" : "bg-accent"
                      }`}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {next && (
            <Link
              href={`/learn/${tracks.find((t) => t.lessons.some((l) => l.slug === next.slug))?.slug}/${next.slug}`}
              className="btn-ghost btn-sm mt-5"
            >
              Continue: {next.title} →
            </Link>
          )}
        </section>

        {/* ------------------------------------------------------- activity */}
        <section className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">Study activity</h2>
            <span className="font-mono text-2xs text-faint">last 12 weeks</span>
          </div>
          <div className="mt-4">
            <ActivityChart data={weeks} />
          </div>
          <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-faint">
            Consistency beats intensity here. Twenty minutes on most days will take you further
            than one long session a fortnight.
          </p>
        </section>
      </div>

      {/* -------------------------------------------------------- practice */}
      <section className="mt-4 rounded-lg border border-line bg-surface p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">Chart practice</h2>
          <Link href="/practice" className="text-xs text-accent hover:underline">
            Open practice →
          </Link>
        </div>

        <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {(Object.keys(MODE_LABEL) as (keyof typeof MODE_LABEL)[]).map((mode) => {
            const inMode = exercises.filter((e) => e.mode === mode);
            const bests = inMode.map((e) => exerciseScores[e.id]?.best ?? null);
            const tried = bests.filter((b) => b !== null) as number[];
            const avg = tried.length
              ? Math.round(tried.reduce((a, b) => a + b, 0) / tried.length)
              : null;
            return (
              <div key={mode}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-ink">{MODE_LABEL[mode]}</span>
                  <span className="shrink-0 font-mono text-2xs text-faint tnum">
                    {avg == null ? "not attempted" : `${avg}% avg · ${tried.length}/${inMode.length}`}
                  </span>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {inMode.map((e) => {
                    const best = exerciseScores[e.id]?.best;
                    return (
                      <span
                        key={e.id}
                        title={`${e.title}${best == null ? " — not attempted" : ` — best ${best}%`}`}
                        className={`h-1.5 flex-1 rounded-full ${
                          best === 100
                            ? "bg-up"
                            : best != null && best >= 50
                              ? "bg-signal"
                              : best != null
                                ? "bg-down"
                                : "bg-line"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------- reset */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-raised/40 px-4 py-3">
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-faint">
          Progress lives in this browser&rsquo;s local storage. Clearing site data, or using a
          different browser or device, will start you from scratch.
        </p>
        {confirming ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                reset();
                setConfirming(false);
              }}
              className="btn border-down bg-down/10 px-3 py-1.5 text-xs text-down hover:bg-down/20"
            >
              Yes, erase everything
            </button>
            <button onClick={() => setConfirming(false)} className="btn-ghost btn-sm">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setConfirming(true)} className="btn-ghost btn-sm">
            Reset progress
          </button>
        )}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "up" | "signal";
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <dt className="eyebrow">{label}</dt>
      <dd
        className={`mt-1.5 font-mono text-2xl tnum ${
          tone === "up" ? "text-up" : tone === "signal" ? "text-signal" : "text-ink"
        }`}
      >
        {value}
      </dd>
      <dd className="mt-0.5 text-xs text-faint">{sub}</dd>
    </div>
  );
}

/** Bucket the recorded study days into the last 12 calendar weeks. */
function buildWeeks(activeDays: string[]): WeekPoint[] {
  const set = new Set(activeDays);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const out: WeekPoint[] = [];
  for (let w = 11; w >= 0; w--) {
    const end = new Date(today);
    end.setDate(end.getDate() - w * 7);
    let days = 0;
    let first = "";
    for (let d = 6; d >= 0; d--) {
      const day = new Date(end);
      day.setDate(day.getDate() - d);
      const key = dayKey(day);
      if (d === 6) first = day.toLocaleDateString(undefined, { day: "numeric", month: "short" });
      if (set.has(key)) days++;
    }
    out.push({
      label: w === 0 ? "now" : first.split(" ")[0],
      days,
      range: `Week of ${first}`,
    });
  }
  return out;
}
