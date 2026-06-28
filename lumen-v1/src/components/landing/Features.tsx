import styles from "./landing.module.css";

/**
 * Feature grid — the system around the five core tools. Server Component.
 * Each card pairs an inline SVG glyph with original marketing copy (never spec
 * or textbook text).
 */

type Feat = {
  title: string;
  body: string;
  span?: boolean;
  icon: React.ReactNode;
};

const FEATURES: Feat[] = [
  {
    title: "AI study coach",
    span: true,
    body:
      "A persistent companion that knows your course, your topics and your weak spots — and every session points at the one thing actually worth doing next. The reason to open the app.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M12 7v4M12 13.5v.5" />
      </svg>
    ),
  },
  {
    title: "Verified core notes",
    body:
      "The highest-traffic topics are human-reviewed and carry a gold Verified badge — content you can trust, not just content that exists.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Spec-grounded content",
    body:
      "Everything is generated against your exact curriculum, board and subject — so notes, cards and questions map to what you'll actually be examined on.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M4 5h16M4 12h16M4 19h10" />
        <circle cx="19" cy="19" r="2" />
      </svg>
    ),
  },
  {
    title: "Self-checked generation",
    body:
      "Every AI note is drafted by one model and critiqued by a second before you see it. Unverified content is clearly labelled, never disguised.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "Mistake tracking",
    body:
      "Quiz and paper answers feed a record of what you keep getting wrong, so revision targets your gaps instead of the things you already know.",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M12 9v4M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      </svg>
    ),
  },
  {
    title: "Whole-course coverage",
    body:
      "IB, IGCSE, GCSE, AP and A-Level across the core subjects — pick your curriculum at signup and your whole study tree is laid out, topic by topic.",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
    ),
  },
  {
    title: "Built for focus",
    body:
      "A calm, distraction-free workspace: one topic, the five tools, and a tutor a tap away. No feed, no noise — just the next move, lit up.",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.wrap}>
        <span className={`eyebrow ${styles.eyebrowMb}`}>Everything around it</span>
        <h2 className={styles.featuresTitle}>The rest of the system.</h2>
        <p className={`${styles.lead} ${styles.featuresLead}`}>
          The five tools are the spine. These are the parts around them — each one
          feeding the same goal: the highest grade for the least wasted effort.
        </p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className={`${styles.feat} ${f.span ? styles.span2 : ""}`}
            >
              <div className={styles.featIco} aria-hidden="true">
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
