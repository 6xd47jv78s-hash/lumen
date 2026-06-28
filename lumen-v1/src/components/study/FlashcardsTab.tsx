"use client";

// Flashcards tab — a flip-card deck. Counter "Card i / n", front = Prompt,
// back = Answer, prev / flip / next controls. Ported from renderCards in the
// lumen-study.html prototype. Deck position + flip state are local to the tab.

import { useEffect, useState } from "react";
import type { CardsResult } from "@/lib/types";
import { api } from "@/lib/api-client";
import styles from "./study.module.css";
import { AuxLoading, AuxError } from "./AuxState";

type Cell = { data?: CardsResult; error?: boolean };

export default function FlashcardsTab({
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
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);

  // Reset deck position whenever we switch to a new topic/deck.
  useEffect(() => {
    setI(0);
    setFlip(false);
  }, [cacheKey]);

  useEffect(() => {
    if (cell?.data || cell?.error) return;
    let alive = true;
    api
      .aux(curriculum, subject, topic, "cards")
      .then((data) => {
        if (alive) setCache((c) => ({ ...c, [cacheKey]: { data: data as CardsResult } }));
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
    setI(0);
    setFlip(false);
    setNonce((n) => n + 1);
  }

  if (cell?.error) return <AuxError onRetry={regenerate} />;
  if (!cell?.data) return <AuxLoading kind="cards" />;

  const cards = cell.data.cards || [];
  if (!cards.length) return <p className={styles.err}>No cards generated.</p>;

  const idx = i >= cards.length ? 0 : i;
  const c = cards[idx];

  const go = (delta: number) => {
    setI((cards.length + idx + delta) % cards.length);
    setFlip(false);
  };

  return (
    <div>
      <div className={styles.fcWrap}>
        <div className={styles.fcCounter}>
          Card {idx + 1} / {cards.length}
        </div>

        <div
          className={styles.fc + (flip ? " " + styles.flipped : "")}
          onClick={() => setFlip((f) => !f)}
        >
          <div className={styles.fcInner}>
            <div className={styles.fcFace + " " + styles.fcFront}>
              <div className={styles.fcKicker}>Prompt</div>
              <div className={styles.fcQ}>{c.front}</div>
              {!flip ? <div className={styles.fcHint}>click to flip</div> : null}
            </div>
            <div className={styles.fcFace + " " + styles.fcBack}>
              <div className={styles.fcKicker}>Answer</div>
              <div className={styles.fcA}>{c.back}</div>
            </div>
          </div>
        </div>

        <div className={styles.fcControls}>
          <button
            className="icon-btn"
            aria-label="Previous card"
            onClick={() => go(-1)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className={"icon-btn " + styles.flipBtn}
            onClick={() => setFlip((f) => !f)}
          >
            Flip
          </button>
          <button
            className="icon-btn"
            aria-label="Next card"
            onClick={() => go(1)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.regen}>
        <button onClick={regenerate}>↻ Regenerate</button>
      </div>
    </div>
  );
}
