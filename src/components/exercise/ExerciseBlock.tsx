"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PriceChart, type BarHighlight, type UserLevel } from "@/components/chart/ChartBlock";
import { EXERCISE_BY_ID } from "@/content/exercises";
import { getSeries } from "@/lib/market/generate";
import type { BarExercise, ChoiceExercise, Exercise, LevelsExercise } from "@/lib/exercise/types";
import type { ChartSpec } from "@/lib/market/types";
import { useProgress } from "@/store/progress";
import { renderInline } from "@/components/content/RichText";

export function ExerciseBlock({
  exerciseId,
  children,
}: {
  exerciseId: string;
  children?: ReactNode;
}) {
  const exercise = EXERCISE_BY_ID[exerciseId];
  if (!exercise) return null;
  return (
    <div className="my-8">
      {children && <p className="mb-3 text-[0.975rem] leading-[1.75] text-muted">{children}</p>}
      <ExerciseRunner exercise={exercise} />
    </div>
  );
}

export function ExerciseRunner({
  exercise,
  onComplete,
  compact,
}: {
  exercise: Exercise;
  onComplete?: (score: number) => void;
  compact?: boolean;
}) {
  switch (exercise.kind) {
    case "levels":
      return <LevelsRunner ex={exercise} onComplete={onComplete} compact={compact} />;
    case "bar":
      return <BarRunner ex={exercise} onComplete={onComplete} compact={compact} />;
    case "choice":
      return <ChoiceRunner ex={exercise} onComplete={onComplete} compact={compact} />;
  }
}

/* ------------------------------------------------------------------ shell */

function Shell({
  ex,
  children,
  footer,
  compact,
}: {
  ex: Exercise;
  children: ReactNode;
  footer: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-accent/30 bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-accent-soft/45 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="eyebrow text-accent">Exercise</span>
          {!compact && <span className="text-sm font-semibold text-ink">{ex.title}</span>}
        </div>
        <span className="eyebrow" title={`Difficulty ${ex.difficulty} of 3`}>
          {"●".repeat(ex.difficulty)}
          <span className="text-line-strong">{"●".repeat(3 - ex.difficulty)}</span>
        </span>
      </header>
      <div className="p-4">
        <p className="mb-3 text-sm leading-relaxed text-muted">{ex.brief}</p>
        {children}
      </div>
      <footer className="border-t border-line bg-raised/50 px-4 py-3">{footer}</footer>
    </section>
  );
}

function Debrief({ lines, score }: { lines: string[]; score: number }) {
  return (
    <div className="animate-fade-up">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`font-mono text-sm font-semibold tnum ${
            score >= 100 ? "text-up" : score >= 50 ? "text-signal" : "text-down"
          }`}
        >
          {score}%
        </span>
        <span className="eyebrow">
          {score >= 100 ? "Model answer matched" : score >= 50 ? "Partly right" : "Not yet"}
        </span>
      </div>
      {lines.map((line, i) => (
        <p key={i} className="mt-2 text-sm leading-relaxed text-muted">
          {renderInline(line, `db${i}`)}
        </p>
      ))}
    </div>
  );
}

function useRecorder(id: string, onComplete?: (score: number) => void) {
  const record = useProgress((s) => s.recordExercise);
  return (score: number) => {
    record(id, score);
    onComplete?.(score);
  };
}

/* ----------------------------------------------------------------- levels */

function LevelsRunner({
  ex,
  onComplete,
  compact,
}: {
  ex: LevelsExercise;
  onComplete?: (s: number) => void;
  compact?: boolean;
}) {
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [graded, setGraded] = useState<{ score: number; hits: number } | null>(null);
  const record = useRecorder(ex.id, onComplete);
  const series = useMemo(
    () => getSeries(ex.spec.scenario, ex.spec.seed, ex.spec.bars, ex.spec.aggregate),
    [ex.spec],
  );

  const revealSpec: ChartSpec = useMemo(
    () => ({
      ...ex.spec,
      levels: ex.targets.map((t) => ({
        anchor: t.anchor,
        label: t.label,
        kind: t.kind,
      })),
    }),
    [ex.spec, ex.targets],
  );

  function place(price: number) {
    if (graded || levels.length >= ex.maxLevels) return;
    setLevels((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, price: Number(price.toFixed(2)), correct: null },
    ]);
  }

  function grade() {
    const used = new Set<string>();
    const marked = levels.map((lvl) => ({ ...lvl }));
    let hits = 0;

    for (const target of ex.targets) {
      const price = series.anchors[target.anchor];
      if (price == null) continue;
      const tol = (price * ex.tolerancePct) / 100;
      let bestIdx = -1;
      let bestDist = Infinity;
      marked.forEach((lvl, i) => {
        if (used.has(lvl.id)) return;
        const d = Math.abs(lvl.price - price);
        if (d <= tol && d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      });
      if (bestIdx >= 0) {
        used.add(marked[bestIdx].id);
        marked[bestIdx].correct = true;
        marked[bestIdx].label = target.label;
        hits++;
      }
    }
    for (const lvl of marked) if (lvl.correct == null) lvl.correct = false;

    const stray = marked.length - hits;
    const score = Math.max(
      0,
      Math.round((hits / ex.targets.length) * 100 - stray * 20),
    );
    setLevels(marked);
    setGraded({ score, hits });
    record(score);
  }

  function reset() {
    setLevels([]);
    setGraded(null);
  }

  return (
    <Shell
      ex={ex}
      compact={compact}
      footer={
        graded ? (
          <>
            <Debrief lines={ex.debrief} score={graded.score} />
            <button onClick={reset} className="btn-ghost btn-sm mt-3">
              Try again
            </button>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={grade}
              disabled={levels.length === 0}
              className="btn-primary btn-sm"
            >
              Check my levels
            </button>
            <button
              onClick={reset}
              disabled={levels.length === 0}
              className="btn-ghost btn-sm"
            >
              Clear
            </button>
            <span className="ml-auto font-mono text-2xs text-faint">
              {levels.length}/{ex.maxLevels} placed
            </span>
          </div>
        )
      }
    >
      <PriceChart
        spec={graded ? revealSpec : ex.spec}
        showOverlays={!!graded}
        userLevels={levels}
        onPriceClick={place}
      />
      {levels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              disabled={!!graded}
              onClick={() => setLevels((p) => p.filter((l) => l.id !== lvl.id))}
              className={`rounded border px-2 py-1 font-mono text-2xs tnum transition-colors ${
                lvl.correct === true
                  ? "border-up/50 bg-up/10 text-up"
                  : lvl.correct === false
                    ? "border-down/50 bg-down/10 text-down"
                    : "border-line-strong bg-raised text-muted hover:border-down/50 hover:text-down"
              }`}
            >
              {lvl.price}
              {lvl.correct === true && ` ✓ ${lvl.label}`}
              {lvl.correct === false && " ✕"}
              {lvl.correct == null && " ×"}
            </button>
          ))}
        </div>
      )}
      {!graded && (
        <p className="mt-2 text-xs text-faint">
          Click the chart to drop a level. Click a chip to remove it.
        </p>
      )}
    </Shell>
  );
}

/* -------------------------------------------------------------------- bar */

function BarRunner({
  ex,
  onComplete,
  compact,
}: {
  ex: BarExercise;
  onComplete?: (s: number) => void;
  compact?: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [graded, setGraded] = useState<{ score: number; note?: string } | null>(null);
  const record = useRecorder(ex.id, onComplete);
  const series = useMemo(
    () => getSeries(ex.spec.scenario, ex.spec.seed, ex.spec.bars, ex.spec.aggregate),
    [ex.spec],
  );
  const answer = Math.round(series.anchors[ex.answerAnchor] ?? 0);

  function grade() {
    if (picked == null) return;
    const correct = Math.abs(picked - answer) <= ex.window;
    const trap = !correct
      ? ex.traps?.find((t) => {
          const idx = series.anchors[t.anchor];
          return idx != null && Math.abs(picked - Math.round(idx)) <= t.window;
        })
      : undefined;
    // A near-miss on a documented trap is a *reasoning* error worth partial
    // credit — it means the student read the chart but misidentified the beat.
    const score = correct ? 100 : trap ? 50 : 0;
    setGraded({ score, note: trap?.message });
    record(score);
  }

  const highlights: BarHighlight[] = useMemo(() => {
    if (!graded || picked == null) {
      return picked == null ? [] : [{ index: picked, kind: "hint", text: "your pick" }];
    }
    const correct = Math.abs(picked - answer) <= ex.window;
    return correct
      ? [{ index: picked, kind: "correct", text: "correct" }]
      : [
          { index: picked, kind: "wrong", text: "your pick" },
          { index: answer, kind: "correct", text: "answer" },
        ];
  }, [graded, picked, answer, ex.window]);

  return (
    <Shell
      ex={ex}
      compact={compact}
      footer={
        graded ? (
          <>
            {graded.note && (
              <p className="mb-3 rounded border border-signal/40 bg-signal/[0.07] px-3 py-2 text-sm leading-relaxed text-ink/90">
                {graded.note}
              </p>
            )}
            <Debrief lines={ex.debrief} score={graded.score} />
            <button
              onClick={() => {
                setPicked(null);
                setGraded(null);
              }}
              className="btn-ghost btn-sm mt-3"
            >
              Try again
            </button>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={grade} disabled={picked == null} className="btn-primary btn-sm">
              Check my answer
            </button>
            <span className="ml-auto font-mono text-2xs text-faint">
              {picked == null ? "click a bar on the chart" : `bar ${picked + 1} selected`}
            </span>
          </div>
        )
      }
    >
      <PriceChart
        spec={ex.spec}
        showOverlays={!!graded}
        highlights={highlights}
        onBarClick={(i) => !graded && setPicked(i)}
      />
    </Shell>
  );
}

/* ----------------------------------------------------------------- choice */

function ChoiceRunner({
  ex,
  onComplete,
  compact,
}: {
  ex: ChoiceExercise;
  onComplete?: (s: number) => void;
  compact?: boolean;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [graded, setGraded] = useState(false);
  const record = useRecorder(ex.id, onComplete);

  function grade() {
    if (picked == null) return;
    setGraded(true);
    record(picked === ex.answer ? 100 : 0);
  }

  return (
    <Shell
      ex={ex}
      compact={compact}
      footer={
        graded ? (
          <>
            {picked != null && ex.optionFeedback?.[picked] && (
              <p
                className={`mb-3 rounded border px-3 py-2 text-sm leading-relaxed ${
                  picked === ex.answer
                    ? "border-up/40 bg-up/[0.07] text-ink/90"
                    : "border-down/40 bg-down/[0.07] text-ink/90"
                }`}
              >
                {ex.optionFeedback[picked]}
              </p>
            )}
            <Debrief lines={ex.debrief} score={picked === ex.answer ? 100 : 0} />
            <button
              onClick={() => {
                setPicked(null);
                setGraded(false);
              }}
              className="btn-ghost btn-sm mt-3"
            >
              Try again
            </button>
          </>
        ) : (
          <button onClick={grade} disabled={picked == null} className="btn-primary btn-sm">
            Check my answer
          </button>
        )
      }
    >
      <PriceChart spec={ex.spec} showOverlays={graded} />
      <p className="mb-2 mt-4 text-sm font-medium text-ink">{ex.question}</p>
      <div className="space-y-2">
        {ex.options.map((opt, i) => {
          const state = !graded
            ? picked === i
              ? "picked"
              : "idle"
            : i === ex.answer
              ? "right"
              : picked === i
                ? "wrong"
                : "idle";
          return (
            <button
              key={i}
              disabled={graded}
              onClick={() => setPicked(i)}
              className={`flex w-full gap-3 rounded-md border px-3.5 py-2.5 text-left text-sm leading-relaxed transition-colors ${
                state === "right"
                  ? "border-up/60 bg-up/[0.08] text-ink"
                  : state === "wrong"
                    ? "border-down/60 bg-down/[0.08] text-ink"
                    : state === "picked"
                      ? "border-accent bg-accent-soft text-ink"
                      : "border-line bg-raised/50 text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              <span className="mt-px font-mono text-2xs text-faint">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}
