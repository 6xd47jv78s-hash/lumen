"use client";

// Notes tab — a single AI note for the whole topic (+ server-side self-check).
// Renders a status badge, optional "what to double-check" flags, the summary,
// sections, a key-terms grid, exam tips, a regenerate affordance and a
// disclaimer. Mirrors renderNotes/noteBody from the lumen-study.html prototype.

import { useEffect, useState } from "react";
import type { NoteResult } from "@/lib/types";
import { api } from "@/lib/api-client";
import styles from "./study.module.css";

type Cell = { data?: NoteResult; error?: boolean };

export default function NotesTab({
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

  useEffect(() => {
    if (cell?.data || cell?.error) return;
    let alive = true;
    api
      .topicNote(curriculum, subject, topic)
      .then((data) => {
        if (alive) setCache((c) => ({ ...c, [cacheKey]: { data } }));
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
    setNonce((n) => n + 1);
  }

  if (cell?.error) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.err}>
          Couldn&rsquo;t reach the AI to write these notes just now. Check the
          connection and try again — your other tabs still work.
        </p>
        <button className="btn btn-ghost btn-sm" onClick={regenerate}>
          Try again
        </button>
      </div>
    );
  }

  if (!cell?.data) {
    return <NotesLoading />;
  }

  const { note, status, check } = cell.data;
  const verified = status === "verified";

  return (
    <div>
      <Badge status={status} check={check} />

      {check?.verdict === "revise" && check.flags?.length ? (
        <div className={styles.nflags}>
          <h4>What to double-check</h4>
          <ul>
            {check.flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {note.summary ? (
        <div className={styles.noteSummary}>{note.summary}</div>
      ) : null}

      {(note.sections || []).map((sec, i) => (
        <div className={styles.noteSec} key={i}>
          <h3>{sec.heading}</h3>
          <ul>
            {(sec.points || []).map((p, j) => (
              <li key={j}>{p}</li>
            ))}
          </ul>
        </div>
      ))}

      {note.keyTerms?.length ? (
        <>
          <h3 className={styles.termsTitle}>Key terms</h3>
          <div className={styles.terms}>
            {note.keyTerms.map((t, i) => (
              <div className={styles.term} key={i}>
                <b>{t.term}</b>
                <span>{t.definition}</span>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {note.examTips?.length ? (
        <div className={styles.tips}>
          <h3>Exam tips</h3>
          <ul>
            {note.examTips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {verified ? (
        <div className={styles.disclaimer}>
          Part of a verified pack — reviewed and signed off.
        </div>
      ) : (
        <>
          <div className={styles.regen}>
            <button onClick={regenerate}>↻ Regenerate</button>
          </div>
          <div className={styles.disclaimer}>
            AI-generated · accurate for guidance, but check against your official{" "}
            {curriculum} syllabus.
          </div>
        </>
      )}
    </div>
  );
}

function Badge({
  status,
  check,
}: {
  status: string;
  check?: NoteResult["check"];
}) {
  if (status === "verified") {
    return (
      <span className="nbadge verified" style={{ marginBottom: 18 }}>
        ✓ Verified · reviewed &amp; approved
      </span>
    );
  }
  if (status === "flagged" || check?.verdict === "revise") {
    return (
      <span className="nbadge flag" style={{ marginBottom: 18 }}>
        ⚠ Flagged — verify before relying on this
      </span>
    );
  }
  if (check?.verdict === "pass" || status === "checked") {
    return (
      <span className="nbadge checked" style={{ marginBottom: 18 }}>
        ✓ AI self-checked
      </span>
    );
  }
  return (
    <span className="nbadge flag" style={{ marginBottom: 18 }}>
      AI-generated
    </span>
  );
}

function NotesLoading() {
  const widths = [88, 72, 80, 60];
  return (
    <div className={styles.stateBox}>
      {widths.map((w, i) => (
        <div className="shimmer" key={i} style={{ width: `${w}%`, margin: "10px auto" }} />
      ))}
      <div className="gen-msg" style={{ marginTop: 18 }}>
        <span className="spark" />
        Writing your notes with AI…
      </div>
    </div>
  );
}
