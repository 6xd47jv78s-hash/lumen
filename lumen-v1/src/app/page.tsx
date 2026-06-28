import Link from "next/link";
import AuthControls from "@/components/AuthControls";
import Ambient from "@/components/landing/Ambient";
import Nav from "@/components/landing/Nav";
import Prism from "@/components/landing/Prism";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import styles from "@/components/landing/landing.module.css";

/**
 * Lumen marketing landing page.
 *
 * A Server Component that ports the lumen-website.html prototype into React and
 * reframes it around the real V1 product: the five study tools and a verified
 * core. The only client code is <Nav> (its mobile-menu toggle); <AuthControls>
 * is an async server component handed to it as a slot.
 */
export default function Home() {
  return (
    <>
      <Ambient />
      <Nav authSlot={<AuthControls />} />

      <main id="top">
        {/* ---------------------------------------------------------- hero --- */}
        <header className={styles.hero}>
          <div className={styles.lightSource} aria-hidden="true">
            <div className={styles.rays} />
            <div className={styles.heroOrb} />
          </div>

          <span className={`eyebrow ${styles.heroEyebrow} ${styles.eyebrowMb}`}>
            AI study platform
          </span>
          <h1 className={styles.heroTitle}>
            Study, <span className={styles.glowWord}>illuminated</span>.
          </h1>
          <p className={`${styles.lead} ${styles.heroLead}`}>
            Lumen is the study platform that tells you what to focus on. Pick your
            course and it gives you verified notes, flashcards, quizzes, past
            papers and an AI tutor for every topic — and points you at the one
            worth your next hour.
          </p>

          <div className={styles.ctaRow}>
            <Link className="btn btn-primary" href="/onboarding">
              Start studying
            </Link>
            <a className="btn btn-ghost" href="#product">
              See how it works
            </a>
          </div>

          <p className={styles.heroMeta}>
            <b>IB · IGCSE · GCSE · AP · A-Level</b> · five tools per topic · a
            verified core you can trust
          </p>

          <div className={styles.scrollCue} aria-hidden="true">
            <span className={styles.scrollDot} />
            <span>SCROLL</span>
          </div>
        </header>

        {/* the five tools, split from one beam */}
        <Prism />

        {/* the system around the tools */}
        <Features />

        {/* free vs pro */}
        <Pricing />

        {/* closing call to action */}
        <section className={`${styles.section} ${styles.closing}`} id="start">
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.wrap}>
            <h2>Stop revising in the dark.</h2>
            <p className={`${styles.lead} ${styles.closingLead}`}>
              Point Lumen at one subject and watch the next move light up. The
              grade comes from knowing where to look.
            </p>
            <div className={styles.ctaRow}>
              <Link className="btn btn-primary" href="/onboarding">
                Start studying
              </Link>
              <a className="btn btn-ghost" href="#pricing">
                See pricing
              </a>
            </div>
            <p className={styles.fineprint}>
              Free to start · no card required to learn your first subject.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
