import styles from "./landing.module.css";

/**
 * Decorative ambient blobs behind the landing page. Purely cosmetic, so it is
 * hidden from assistive tech. CSS-only (no JS); the heavier canvas photon field
 * from the prototype is intentionally dropped to keep this a Server Component.
 */
export default function Ambient() {
  return (
    <div aria-hidden="true">
      <span className={`${styles.blob} ${styles.b1}`} />
      <span className={`${styles.blob} ${styles.b2}`} />
      <span className={`${styles.blob} ${styles.b3}`} />
    </div>
  );
}
