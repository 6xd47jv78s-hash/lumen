import styles from "./landing.module.css";

/**
 * Marketing footer. Carries the verification + safeguarding note required
 * before any real launch: AI content is self-checked; only the verified core
 * is human-reviewed; many users are minors.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footWrap}>
        <div>
          <div className="brand">
            <span className="monogram" aria-hidden="true">
              L
            </span>
            <span className="brand-name">Lumen</span>
          </div>
          <p className={styles.footTag}>
            An AI study platform for students who are done guessing what to revise.
          </p>
        </div>
        <nav className={styles.footLinks} aria-label="Footer">
          <a href="#product">Product</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#top">Back to top</a>
        </nav>

        <p className={styles.safeguard}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span>
            Most content is AI-generated and self-checked, and is clearly labelled
            as such; topics in the verified core are human-reviewed and carry a
            gold Verified badge. Lumen is built for students, many of whom are
            minors — we treat privacy, data protection and safeguarding as
            launch-blocking, and generate original notes rather than reproducing
            any exam-board specification or textbook text.
          </span>
        </p>

        <p className={styles.copy}>
          © 2026 Lumen · A lumen is the unit of light — a fitting name for the
          thing that shows you where to look.
        </p>
      </div>
    </footer>
  );
}
