"use client";

// Onboarding — pick ONE curriculum, then multi-select subjects, then "Enter Lumen".
// Ported from the lumen-study.html prototype (#onboarding). Two steps:
//   Step 01 — curriculum chip row (single choice)
//   Step 02 — subject toggle grid (multi-select, each tinted by subjColor)
// On mount we prefill from api.getAccount(); on submit we save + go to /study.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CURRICULA, CUR, subjColor } from "@/lib/curriculum";
import { api } from "@/lib/api-client";
import styles from "./onboarding.module.css";

export default function OnboardingPage() {
  const router = useRouter();

  const [cur, setCur] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Prefill any existing selection saved on the account.
  useEffect(() => {
    let alive = true;
    api
      .getAccount()
      .then((acc) => {
        if (!alive || !acc) return;
        if (acc.curriculum && CUR[acc.curriculum]) {
          setCur(acc.curriculum);
          const valid = (acc.subjects || []).filter((s) =>
            CUR[acc.curriculum as string].includes(s)
          );
          setSubjects(valid);
        }
      })
      .catch(() => {
        /* not signed in / no account yet — start fresh */
      });
    return () => {
      alive = false;
    };
  }, []);

  function pickCurriculum(c: string) {
    // Switching curriculum clears any subjects from the previous one.
    if (c === cur) return;
    setCur(c);
    setSubjects([]);
  }

  function toggleSubject(s: string) {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const ready = !!cur && subjects.length > 0;

  const hint = !cur
    ? "Choose a curriculum to begin."
    : subjects.length === 0
      ? "Pick at least one subject."
      : `${subjects.length} subject${subjects.length > 1 ? "s" : ""} selected.`;

  async function enterLumen() {
    if (!ready || saving) return;
    setSaving(true);
    try {
      await api.saveAccount(cur as string, subjects);
      router.push("/study");
    } catch {
      // If saving fails, still let the user retry rather than trapping them.
      setSaving(false);
    }
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.blob + " " + styles.b1} aria-hidden="true" />
      <div className={styles.blob + " " + styles.b2} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.card}>
        <div className={styles.eyebrow}>Set up your Lumen</div>
        <h1 className={styles.title}>
          Tell us what you&rsquo;re <em>studying</em>.
        </h1>
        <p className={styles.lead}>
          Pick your course and your subjects. Everything in Lumen — notes,
          flashcards, quizzes, past papers — is then built around exactly what
          you chose.
        </p>

        {/* Step 01 — curriculum */}
        <p className={styles.stepLabel}>
          Step <b>01</b> — your curriculum
        </p>
        <div className={styles.chipRow} role="group" aria-label="Curriculum">
          {CURRICULA.map((c) => (
            <button
              key={c}
              type="button"
              className={"chip" + (c === cur ? " sel" : "")}
              aria-pressed={c === cur}
              onClick={() => pickCurriculum(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Step 02 — subjects (revealed once a curriculum is chosen) */}
        {cur && (
          <div className={styles.subjStep}>
            <p className={styles.stepLabel}>
              Step <b>02</b> — your subjects
            </p>
            <div className={styles.subjGrid} role="group" aria-label="Subjects">
              {CUR[cur].map((s) => {
                const selected = subjects.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={styles.subjPick + (selected ? " " + styles.sel : "")}
                    style={{ ["--sc" as string]: subjColor(s) }}
                    aria-pressed={selected}
                    onClick={() => toggleSubject(s)}
                  >
                    <span className={styles.dot} aria-hidden="true" />
                    <span className={styles.name}>{s}</span>
                    <span className={styles.tick} aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.foot}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!ready || saving}
            onClick={enterLumen}
          >
            {saving ? "Entering…" : "Enter Lumen"}
          </button>
          <span className={styles.hint}>{hint}</span>
        </div>
      </div>
    </main>
  );
}
