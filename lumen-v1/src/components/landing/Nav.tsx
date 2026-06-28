"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import styles from "./landing.module.css";

/**
 * Sticky top navigation for the marketing landing page.
 *
 * A tiny client component: the only interactivity is the mobile menu toggle.
 * The auth controls (a server component) are passed in as `authSlot` so this
 * stays a thin "use client" shell without pulling server code into the bundle.
 */
export default function Nav({ authSlot }: { authSlot: ReactNode }) {
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <a href="#product" onClick={() => setOpen(false)}>
        Product
      </a>
      <a href="#features" onClick={() => setOpen(false)}>
        Features
      </a>
      <a href="#pricing" onClick={() => setOpen(false)}>
        Pricing
      </a>
      <span className={styles.authSlot}>{authSlot}</span>
      <Link
        className={styles.navCta}
        href="/onboarding"
        onClick={() => setOpen(false)}
      >
        Start studying
      </Link>
    </>
  );

  return (
    <nav className={styles.nav} aria-label="Primary">
      <Link className={`brand ${styles.brandLink}`} href="#top" aria-label="Lumen home">
        <span className="monogram" aria-hidden="true">
          L
        </span>
        <span className="brand-name">Lumen</span>
      </Link>

      {/* desktop links */}
      <div className={`${styles.navLinks} ${styles.navLinksDesktop}`}>{links}</div>

      {/* mobile dropdown (toggled) */}
      {open && (
        <div className={`${styles.navLinks} ${styles.open}`} id="mobile-menu">
          {links}
        </div>
      )}

      <button
        className={styles.navToggle}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>
    </nav>
  );
}
