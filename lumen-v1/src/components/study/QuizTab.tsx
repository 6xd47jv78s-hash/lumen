"use client";

// Quiz tab — one question at a time, four lettered options, locked after a
// choice, correct/wrong marking, an explanation and a running score, then a
// final score screen with "Try again". Ported from renderQuiz in the prototype.

import { useEffect, useState } from "react";
import type { QuizResult } from "@/lib/types";
import { api } from "@/lib/api-client";
import styles from "./study.module.css";
import { AuxLoading, AuxError } from "./AuxState";

type Cell = { data?: QuizResult; error?: boolean };
type Run = { i: number; score: number; chosen: number | null; done: boolean };

const FRESH: Run = { i: 0, score: 0, chosen: null, done: false };
const LETTERS = ["A", "B", "C", "D", "E"];

export default function QuizTab({
  curriculum,
  subject,
  topic,
  cacheKey,
  cache,
  setCache,
}: {
  curriculum: string;
  subject: string;
  topic: string;
  cacheKey: string;
  cache: Record<string, Cell>;
  setCache: React.Dispatch<React.SetStateAction<Record<string, Cell>>>;
}) {
  const cell = cache[cacheKey];
  const [nonce, setNonce] = useState(0);
  const [run, setRun] = useState<Run>(FRESH);

  // New topic/quiz → reset the run.
  useEffect(() => {
    setRun(FRESH);
  }, [cacheKey]);

  useEffect(() => {
    if (cell?.data || cell?.error) return;
    let alive = true;
    api
      .aux(curriculum, subject, topic, "quiz")
      .then((data) => {
        if (alive) setCache((c) => ({ ...c, [cacheKey]: { data: data as QuizResult } }));
      })
      .catch(() => {
        if (alive) setCache((c) => ({ ...c, [cacheKey]: { error: true } }));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, nonce]);

  function regenerate() {
    setCache((c) => {
      const next = { ...c };
      delete next[cacheKey];
      return next;
    });
    setRun(FRESH);
    setNonce((n) => n + 1);
  }

  if (cell?.error) return <AuxError onRetry={regenerate} />;
  if (!cell?.data) return <AuxLoading kind="quiz" />;

  const qs = cell.data.questions || [];
  if (!qs.length) return <p className={styles.err}>No questions generated.</p>;

  if (run.done) {
    const msg =
      run.score === qs.length
        ? "Perfect — that topic's lit up."
        : run.score >= Math.ceil(qs.length * 0.6)
          ? "Solid. A couple to firm up."
          : "Worth another pass through the notes.";
    return (
      <div>
        <div className={styles.scoreBig}>
          {run.score} / {qs.length}
        </div>
        <div className={styles.scoreSub}>{msg}</div>
        <div className={styles.scoreActions}>
          <button className="btn btn-primary" onClick={() => setRun(FRESH)}>
            Try again
          </button>
        </div>
        <div className={styles.regen}>
          <button onClick={regenerate}>↻ Regenerate</button>
        </div>
      </div>
    );
  }

  const q = qs[run.i];
  const last = run.i === qs.length - 1;

  function choose(oi: number) {
    if (run.chosen != null) return;
    setRun((r) => ({
      ...r,
      chosen: oi,
      score: oi === q.answer ? r.score + 1 : r.score,
    }));
  }

  function advance() {
    if (last) setRun((r) => ({ ...r, done: true }));
    else setRun((r) => ({ ...r, i: r.i + 1, chosen: null }));
  }

  return (
    <div>
      <div className={styles.quizProg}>
        Question {run.i + 1} of {qs.length} · score {run.score}
      </div>
      <div className={styles.quizQ}>{q.q}</div>

      {(q.options || []).map((opt, oi) => {
        let cls = styles.opt;
        if (run.chosen != null) {
          if (oi === q.answer) cls += " " + styles.correct;
          else if (oi === run.chosen) cls += " " + styles.wrong;
        }
        return (
          <button
            key={oi}
            className={cls}
            disabled={run.chosen != null}
            onClick={() => choose(oi)}
          >
            <span className={styles.optLetter}>{LETTERS[oi]}</span>
            {opt}
          </button>
        );
      })}

      {run.chosen != null ? (
        <>
          <div className={styles.explain}>
            <b>{run.chosen === q.answer ? "Correct. " : "Not quite. "}</b>
            {q.explanation}
          </div>
          <div className={styles.quizFoot}>
            <span />
            <button className="btn btn-primary" onClick={advance}>
              {last ? "See score" : "Next question →"}
            </button>
          </div>
        </>
      ) : null}

      <div className={styles.regen}>
        <button onClick={regenerate}>↻ Regenerate</button>
      </div>
    </div>
  );
}
