import Link from "next/link";
import styles from "./landing.module.css";

/**
 * Pricing — Free vs Pro. Server Component. Both CTAs route to /onboarding
 * (account creation happens there; Pro is the unlimited-generation plan).
 */

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <section className={styles.section} id="pricing">
      <div className={styles.wrap}>
        <span className={`eyebrow ${styles.eyebrowMb}`}>Pricing</span>
        <h2 className={styles.pricingTitle}>Start free. Go unlimited when you're ready.</h2>
        <p className={`${styles.lead} ${styles.pricingLead}`}>
          A genuinely useful free tier to learn one subject end to end. Pro lifts
          the limits when Lumen becomes how you study.
        </p>

        <div className={styles.priceGrid}>
          {/* Free */}
          <div className={styles.priceCard}>
            <div className={styles.priceHead}>
              <span className={styles.planName}>Free</span>
            </div>
            <div className={styles.price}>
              <span className={styles.priceAmt}>£0</span>
              <span className={styles.pricePer}>/ forever</span>
            </div>
            <p className={styles.priceBlurb}>
              Everything you need to learn one subject properly.
            </p>
            <ul className={styles.featList}>
              <li>
                <Check /> One curriculum and subject of your choice
              </li>
              <li>
                <Check /> Verified core notes on the key topics
              </li>
              <li>
                <Check /> Daily AI generation across all five tools
              </li>
              <li>
                <Check /> Flashcards, quizzes and past papers
              </li>
              <li className={styles.muted}>
                <Check /> AI tutor — fair daily limit
              </li>
            </ul>
            <Link className={`btn btn-ghost ${styles.priceCta}`} href="/onboarding">
              Start studying free
            </Link>
          </div>

          {/* Pro */}
          <div className={`${styles.priceCard} ${styles.pro}`}>
            <div className={styles.priceHead}>
              <span className={styles.planName}>Pro</span>
              <span className={styles.planTag}>Unlimited</span>
            </div>
            <div className={styles.price}>
              <span className={styles.priceAmt}>£9</span>
              <span className={styles.pricePer}>/ month</span>
            </div>
            <p className={styles.priceBlurb}>
              No caps. Every subject, every topic, on demand.
            </p>
            <ul className={styles.featList}>
              <li>
                <Check /> Everything in Free
              </li>
              <li>
                <Check /> All your subjects, every topic
              </li>
              <li>
                <Check /> Unlimited notes, cards, quizzes and papers
              </li>
              <li>
                <Check /> Unlimited AI tutor conversations
              </li>
              <li>
                <Check /> Priority access to new tools
              </li>
            </ul>
            <Link className={`btn btn-primary ${styles.priceCta}`} href="/onboarding">
              Go Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
