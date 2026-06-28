"use client";

// Past Papers tab — exam-style questions, each with a marks pill and a
// "Show mark scheme" reveal listing the marking points. Ported from
// renderPapers in the lumen-study.html prototype.

import { useEffect, useState } from "react";
import type { PapersResult } from "@/lib/types";
import { api } from "@/lib/api-client";
import styles from "./study.module.css";
import { AuxLoading, AuxError } from "./AuxState";

type Cell = { data?: PapersResult; error?: boolean };

export default function PapersTab({
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
  const [open, setOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setOpen({});
  }, [cacheKey]);

  useEffect(() => {
    if (cell?.data || cell?.error) return;
    let alive = true;
    api
      .aux(curriculum, subject, topic, "papers")
      .then((data) => {
        if (alive) setCache((c) => ({ ...c, [cacheKey]: { data: data as PapersResult } }));
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
    setOpen({});
    setNonce((n) => n + 1);
  }

  if (cell?.error) return <AuxError onRetry={regenerate} />;
  if (!cell?.data) return <AuxLoading kind="papers" />;

  const qs = cell.data.questions || [];
  if (!qs.length) return <p className={styles.err}>No questions generated.</p>;

  return (
    <div>
      {qs.map((q, qi) => {
        const shown = !!open[qi];
        return (
          <div className={styles.pp} key={qi}>
            <div className={styles.ppTop}>
              <div className={styles.ppQ}>{q.question}</div>
              <div className={styles.ppMarks}>{q.marks} marks</div>
            </div>
            <div className={styles.ppReveal}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [qi]: !o[qi] }))}
              >
                {shown ? "Hide mark scheme" : "Show mark scheme"}
              </button>
              {shown ? (
                <div className={styles.ms}>
                  <h4>Mark scheme</h4>
                  <ul>
                    {(q.markScheme || []).map((m, mi) => (
                      <li key={mi}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      <div className={styles.regen}>
        <button onClick={regenerate}>↻ Regenerate</button>
      </div>
      <div className={styles.disclaimer}>
        AI-generated · accurate for guidance, but check against your official{" "}
        {curriculum} syllabus.
      </div>
    </div>
  );
}
