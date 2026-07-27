"use client";

import { useMemo, useState } from "react";
import { ExerciseRunner } from "./ExerciseBlock";
import { EXERCISES } from "@/content/exercises";
import { MODE_LABEL, type Exercise } from "@/lib/exercise/types";
import { useProgress } from "@/store/progress";

type Mode = Exercise["mode"] | "all";

const MODES: { id: Mode; label: string; blurb: string }[] = [
  { id: "all", label: "All exercises", blurb: "Everything, ordered by difficulty." },
  { id: "trend", label: MODE_LABEL.trend, blurb: "Read swing structure instead of guessing at direction." },
  { id: "levels", label: MODE_LABEL.levels, blurb: "Place levels on the chart and get scored against model zones." },
  { id: "breakout", label: MODE_LABEL.breakout, blurb: "Close, range and volume — the three-part test." },
  { id: "false-signal", label: MODE_LABEL["false-signal"], blurb: "The skill that separates chart readers from traders." },
];

/**
 * Standalone practice tool. Difficulty unlocks with progress through the Chart
 * Reading track — a student who hasn't met false signals yet shouldn't be
 * failing level-3 fakeout problems and concluding they're bad at this.
 */
export function PracticeTool({ chartLessonSlugs }: { chartLessonSlugs: string[] }) {
  const [mode, setMode] = useState<Mode>("all");
  const [i, setI] = useState(0);
  const lessons = useProgress((s) => s.lessons);
  const scores = useProgress((s) => s.exercises);
  const hydrated = useProgress((s) => s.hydrated);

  const chartDone = hydrated ? chartLessonSlugs.filter((s) => lessons[s]).length : 0;
  // 0-2 lessons → level 1 only; 3-5 → up to level 2; 6+ → everything.
  const unlocked = chartDone >= 6 ? 3 : chartDone >= 3 ? 2 : 1;

  const list = useMemo(() => {
    const filtered = EXERCISES.filter((e) => mode === "all" || e.mode === mode);
    return [...filtered].sort((a, b) => a.difficulty - b.difficulty);
  }, [mode]);

  const current = list[Math.min(i, list.length - 1)];
  const locked = current && current.difficulty > unlocked;

  const attempted = hydrated ? EXERCISES.filter((e) => scores[e.id]).length : 0;
  const mastered = hydrated ? EXERCISES.filter((e) => scores[e.id]?.best === 100).length : 0;

  return (
    <>
      <div className="mt-8 grid gap-6 lg:grid-cols-[15rem_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <p className="eyebrow">Exercise type</p>
          <div className="mt-3 space-y-1">
            {MODES.map((m) => {
              const count =
                m.id === "all"
                  ? EXERCISES.length
                  : EXERCISES.filter((e) => e.mode === m.id).length;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    setI(0);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-accent/50 bg-accent-soft text-ink"
                      : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{m.label}</span>
                  <span className="font-mono text-2xs text-faint tnum">{count}</span>
                </button>
              );
            })}
          </div>

          {hydrated && (
            <div className="mt-6 rounded-lg border border-line bg-surface p-4">
              <p className="eyebrow">Your practice</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Attempted</dt>
                  <dd className="font-mono text-ink tnum">
                    {attempted}/{EXERCISES.length}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Full marks</dt>
                  <dd className="font-mono text-up tnum">{mastered}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Difficulty unlocked</dt>
                  <dd className="font-mono text-accent tnum">{unlocked}/3</dd>
                </div>
              </dl>
              {unlocked < 3 && (
                <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-faint">
                  Complete more of the Chart Reading track to unlock harder problems.
                </p>
              )}
            </div>
          )}
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {list.map((e, k) => {
              const best = scores[e.id]?.best;
              const isLocked = e.difficulty > unlocked;
              return (
                <button
                  key={e.id}
                  onClick={() => setI(k)}
                  title={isLocked ? "Locked" : e.title}
                  className={`h-8 w-8 rounded-md border font-mono text-2xs tnum transition-colors ${
                    k === i
                      ? "border-accent bg-accent text-white"
                      : isLocked
                        ? "border-line bg-surface text-faint/50"
                        : best === 100
                          ? "border-up/50 bg-up/10 text-up"
                          : best != null
                            ? "border-signal/50 bg-signal/10 text-signal"
                            : "border-line bg-surface text-muted hover:border-line-strong"
                  }`}
                >
                  {isLocked ? "·" : k + 1}
                </button>
              );
            })}
          </div>

          {locked ? (
            <div className="rounded-lg border border-line bg-surface p-10 text-center">
              <p className="eyebrow">Locked</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
                This is a difficulty {current.difficulty} problem. Work through more of the Chart
                Reading track first — these exercises assume material you haven&rsquo;t covered
                yet, and failing them for that reason teaches you nothing.
              </p>
            </div>
          ) : (
            current && <ExerciseRunner key={current.id} exercise={current} />
          )}

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setI((v) => Math.max(0, v - 1))}
              disabled={i === 0}
              className="btn-ghost btn-sm"
            >
              ← Previous
            </button>
            <span className="font-mono text-2xs text-faint tnum">
              {Math.min(i + 1, list.length)} / {list.length}
            </span>
            <button
              onClick={() => setI((v) => Math.min(list.length - 1, v + 1))}
              disabled={i >= list.length - 1}
              className="btn-ghost btn-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
