import styles from "./landing.module.css";

/**
 * The "white light, split five ways" centrepiece.
 *
 * A single white beam enters a prism and disperses into five coloured beams —
 * one per study tool: Notes, Flashcards, Quiz, Past Papers, AI Tutor. The SVG
 * is decorative; the real, accessible content is the tool grid beneath it.
 *
 * Server Component — no interactivity, pure markup + CSS hover states.
 */

type Tool = {
  num: string;
  name: string;
  color: string; // a globals.css var, e.g. "var(--bio)"
  blurb: string;
  icon: React.ReactNode;
};

const TOOLS: Tool[] = [
  {
    num: "01",
    name: "Notes",
    color: "var(--chem)",
    blurb:
      "Concise, spec-grounded notes for every topic — summary, key terms and exam tips, written to be revised, not waded through.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
        <path d="M14 4v5h5M8 13h8M8 17h6" />
      </svg>
    ),
  },
  {
    num: "02",
    name: "Flashcards",
    color: "var(--econ)",
    blurb:
      "Active-recall decks generated from each topic, so the facts that matter stick — and the ones you keep missing come back round.",
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="6" width="14" height="10" rx="2" />
        <path d="M7 10h6M7 13h4M21 8v8a2 2 0 0 1-2 2H9" />
      </svg>
    ),
  },
  {
    num: "03",
    name: "Quiz",
    color: "var(--phys)",
    blurb:
      "Instant multiple-choice checks with worked explanations, so you find out what you actually know before the exam does.",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.2 9.5a2.8 2.8 0 0 1 5.5.7c0 1.9-2.8 2.5-2.8 2.5M12 17h.01" />
      </svg>
    ),
  },
  {
    num: "04",
    name: "Past Papers",
    color: "var(--bio)",
    blurb:
      "Exam-style questions with mark schemes, so you practise the way you'll be tested and learn exactly where marks are won.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path d="M14 3v4h4M9 13l2 2 4-4" />
      </svg>
    ),
  },
  {
    num: "05",
    name: "AI Tutor",
    color: "var(--gold)",
    blurb:
      "A subject-aware tutor that explains, re-explains and stretches you — patient at 2am, grounded in the topic you're on.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
];

export default function Prism() {
  return (
    <section className={styles.section} id="product">
      <div className={styles.wrap}>
        <span className={`eyebrow ${styles.eyebrowMb}`}>Five tools, one course</span>
        <h2 className={styles.productTitle}>
          White light, <span className={styles.glowWord}>split five ways</span>.
        </h2>
        <p className={`${styles.lead} ${styles.productLead}`}>
          Point Lumen at a topic and it splits into the five things that move a
          grade — notes to learn it, flashcards to fix it, quizzes to test it,
          past papers to prove it, and a tutor for everything in between.
        </p>

        <div className={styles.prismStage}>
          <svg
            className={styles.prismSvg}
            viewBox="0 0 900 360"
            role="img"
            aria-label="A single white beam of light entering a prism and dispersing into five coloured beams, one for each study tool: Notes, Flashcards, Quiz, Past Papers and AI Tutor."
          >
            <defs>
              <linearGradient id="lm-whiteBeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#fff" stopOpacity=".9" />
              </linearGradient>
              <filter id="lm-soft" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
            </defs>

            {/* incoming white beam */}
            <line
              x1="20"
              y1="180"
              x2="300"
              y2="180"
              stroke="url(#lm-whiteBeam)"
              strokeWidth="3.5"
              filter="url(#lm-soft)"
            />
            {/* prism */}
            <polygon className={styles.prismTri} points="300,110 300,250 410,180" />
            {/* dispersed beams */}
            <g filter="url(#lm-soft)">
              <line x1="395" y1="172" x2="700" y2="60" stroke="var(--chem)" strokeWidth="3" />
              <line x1="398" y1="176" x2="700" y2="120" stroke="var(--econ)" strokeWidth="3" />
              <line x1="400" y1="180" x2="700" y2="180" stroke="var(--phys)" strokeWidth="3" />
              <line x1="398" y1="184" x2="700" y2="240" stroke="var(--bio)" strokeWidth="3" />
              <line x1="395" y1="188" x2="700" y2="300" stroke="var(--gold)" strokeWidth="3" />
            </g>
            {/* labels */}
            <text className={styles.beamLabel} x="712" y="64">Notes</text>
            <text className={styles.beamLabel} x="712" y="124">Flashcards</text>
            <text className={styles.beamLabel} x="712" y="184">Quiz</text>
            <text className={styles.beamLabel} x="712" y="244">Past Papers</text>
            <text className={styles.beamLabel} x="712" y="304">AI Tutor</text>
          </svg>
        </div>

        <ul className={styles.toolGrid}>
          {TOOLS.map((t) => (
            <li
              key={t.name}
              className={styles.toolCard}
              style={{ ["--pc" as string]: t.color }}
            >
              <div className={styles.toolNum}>{t.num}</div>
              <div className={styles.toolIcon} aria-hidden="true">
                {t.icon}
              </div>
              <h3>{t.name}</h3>
              <p>{t.blurb}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
