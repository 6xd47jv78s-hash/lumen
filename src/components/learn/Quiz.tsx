"use client";

import Link from "next/link";
import { useState } from "react";
import { renderInline } from "@/components/content/RichText";
import type { QuizQuestion } from "@/lib/content/types";
import { useProgress } from "@/store/progress";

/**
 * Knowledge check. One question at a time with the explanation shown
 * immediately — the explanation is the teaching, the score is just a gate.
 *
 * Passing (70%) unlocks the next lesson. It's deliberately not 100%: the goal
 * is to catch someone who skimmed, not to punish one misread question.
 */
export function Quiz({
  lessonSlug,
  questions,
  next,
}: {
  lessonSlug: string;
  questions: QuizQuestion[];
  next?: { href: string; title: string } | null;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [done, setDone] = useState(false);

  const complete = useProgress((s) => s.completeLesson);
  const record = useProgress((s) => s.lessons[lessonSlug]);

  const q = questions[i];
  const revealed = answers[i] !== null;
  const score = answers.reduce<number>(
    (acc, a, k) => acc + (a === questions[k].answer ? 1 : 0),
    0,
  );
  const passMark = Math.ceil(questions.length * 0.7);
  const passed = done && score >= passMark;

  function submit() {
    if (picked == null || revealed) return;
    setAnswers((prev) => prev.map((a, k) => (k === i ? picked : a)));
  }

  function advance() {
    if (i < questions.length - 1) {
      setI(i + 1);
      setPicked(null);
      return;
    }
    const final = answers.reduce<number>(
      (acc, a, k) => acc + (a === questions[k].answer ? 1 : 0),
      0,
    );
    setDone(true);
    if (final >= passMark) complete(lessonSlug, final, questions.length);
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setPicked(null);
    setI(0);
    setDone(false);
  }

  if (done) {
    return (
      <section
        id="check"
        className="mt-12 scroll-mt-20 overflow-hidden rounded-lg border border-line bg-surface"
      >
        <div className="border-b border-line px-5 py-4">
          <p className="eyebrow">Knowledge check</p>
        </div>
        <div className="px-5 py-6 text-center">
          <p
            className={`font-mono text-3xl font-semibold tnum ${
              passed ? "text-up" : "text-signal"
            }`}
          >
            {score}/{questions.length}
          </p>
          <p className="mt-2 text-sm text-muted">
            {passed
              ? score === questions.length
                ? "Full marks. Lesson complete."
                : "Passed — lesson marked complete."
              : `You need ${passMark} to pass. Worth re-reading the section above before retrying.`}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={retry} className="btn-ghost btn-sm">
              {passed ? "Retake" : "Try again"}
            </button>
            {passed && next && (
              <Link href={next.href} className="btn-primary btn-sm">
                Next: {next.title} →
              </Link>
            )}
            {passed && !next && (
              <Link href="/dashboard" className="btn-primary btn-sm">
                See your progress →
              </Link>
            )}
          </div>

          {record && record.attempts > 1 && (
            <p className="mt-4 font-mono text-2xs text-faint">
              attempt {record.attempts} · best {record.score}/{record.total}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="check"
      className="mt-12 scroll-mt-20 overflow-hidden rounded-lg border border-line bg-surface"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <p className="eyebrow">Knowledge check</p>
        <div className="flex items-center gap-1.5" aria-label={`Question ${i + 1} of ${questions.length}`}>
          {questions.map((_, k) => (
            <span
              key={k}
              className={`h-1.5 w-5 rounded-full transition-colors ${
                answers[k] == null
                  ? k === i
                    ? "bg-accent"
                    : "bg-line"
                  : answers[k] === questions[k].answer
                    ? "bg-up"
                    : "bg-down"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        <p className="text-[0.975rem] font-medium leading-relaxed text-ink">
          {renderInline(q.prompt, `qp${i}`)}
        </p>

        <div className="mt-4 space-y-2">
          {q.options.map((opt, k) => {
            const state = !revealed
              ? picked === k
                ? "picked"
                : "idle"
              : k === q.answer
                ? "right"
                : answers[i] === k
                  ? "wrong"
                  : "idle";
            return (
              <button
                key={k}
                disabled={revealed}
                onClick={() => setPicked(k)}
                className={`flex w-full gap-3 rounded-md border px-3.5 py-3 text-left text-sm leading-relaxed transition-colors ${
                  state === "right"
                    ? "border-up/60 bg-up/[0.08] text-ink"
                    : state === "wrong"
                      ? "border-down/60 bg-down/[0.08] text-ink"
                      : state === "picked"
                        ? "border-accent bg-accent-soft text-ink"
                        : "border-line bg-raised/40 text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <span className="mt-px font-mono text-2xs text-faint">
                  {String.fromCharCode(65 + k)}
                </span>
                <span>{renderInline(opt, `qo${i}-${k}`)}</span>
                {state === "right" && (
                  <span className="ml-auto shrink-0 text-up" aria-hidden>
                    ✓
                  </span>
                )}
                {state === "wrong" && (
                  <span className="ml-auto shrink-0 text-down" aria-hidden>
                    ✕
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-4 animate-fade-up rounded-md border border-line bg-raised px-4 py-3">
            <p className="eyebrow mb-1.5">
              {answers[i] === q.answer ? "Correct" : "Not quite"}
            </p>
            <p className="text-sm leading-relaxed text-muted">
              {renderInline(q.explain, `qe${i}`)}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line bg-raised/50 px-5 py-3.5">
        <span className="font-mono text-2xs text-faint tnum">
          {i + 1} / {questions.length}
        </span>
        {revealed ? (
          <button onClick={advance} className="btn-primary btn-sm">
            {i < questions.length - 1 ? "Next question" : "See result"}
          </button>
        ) : (
          <button onClick={submit} disabled={picked == null} className="btn-primary btn-sm">
            Check answer
          </button>
        )}
      </div>
    </section>
  );
}
