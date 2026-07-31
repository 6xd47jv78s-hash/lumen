import type { Config } from "tailwindcss";

/**
 * MarketLab design tokens.
 *
 * Colour rule enforced across the codebase: `up` / `down` (green / red) are
 * reserved for market data — candles, price deltas, P&L illustrations. All
 * general UI accent work uses `accent` (blue) or `signal` (amber) so that green
 * and red keep their meaning when a student sees them.
 */
const config: Config = {
  // Dark is the unclassed default and `.light` is the opt-in (see globals.css),
  // so the plain "class" strategy would key `dark:` variants off a class that
  // never exists. Nothing uses `dark:` today — the themes are entirely CSS
  // custom properties — but this keeps the first one that does from silently
  // never matching.
  darkMode: ["selector", "html:not(.light)"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "rgb(var(--c-base) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        raised: "rgb(var(--c-raised) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        "line-strong": "rgb(var(--c-line-strong) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        faint: "rgb(var(--c-faint) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--c-accent-soft) / <alpha-value>)",
        signal: "rgb(var(--c-signal) / <alpha-value>)",
        up: "rgb(var(--c-up) / <alpha-value>)",
        down: "rgb(var(--c-down) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      maxWidth: {
        prose: "68ch",
      },
      borderRadius: {
        md: "0.375rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "none" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--c-accent) / 0.45)" },
          "70%": { boxShadow: "0 0 0 10px rgb(var(--c-accent) / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(var(--c-accent) / 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
