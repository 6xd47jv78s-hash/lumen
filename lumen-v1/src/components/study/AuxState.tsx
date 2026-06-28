"use client";

// Shared loading + error states for the generated tabs (flashcards / quiz /
// past papers). Ported from renderLoading / renderError in the prototype:
// a shimmer block with a pulsing "generating with AI…" message, and a friendly
// error with a retry button.

import styles from "./study.module.css";

const LABELS: Record<string, string> = {
  cards: "Building flashcards",
  quiz: "Setting your quiz",
  papers: "Drafting exam questions",
};

export function AuxLoading({ kind }: { kind: "cards" | "quiz" | "papers" }) {
  const widths = [88, 72, 80, 60];
  return (
    <div className={styles.stateBox}>
      {widths.map((w, i) => (
        <div
          className="shimmer"
          key={i}
          style={{ width: `${w}%`, margin: "10px auto" }}
        />
      ))}
      <div className="gen-msg" style={{ marginTop: 18 }}>
        <span className="spark" />
        {LABELS[kind]} with AI…
      </div>
    </div>
  );
}

export function AuxError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.stateBox}>
      <p className={styles.err}>
        Couldn&rsquo;t reach the AI to generate this just now. Check the
        connection and try again — your other tabs still work.
      </p>
      <button className="btn btn-ghost btn-sm" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
