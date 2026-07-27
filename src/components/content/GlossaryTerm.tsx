"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";

/**
 * A glossary term inside prose. Hover (or focus, or tap on touch) reveals the
 * definition without leaving the lesson; the underlying link goes to the full
 * glossary entry. The point is that a student never hits an unexplained word.
 */
export function GlossaryTerm({
  label,
  term,
  definition,
  href,
}: {
  label: string;
  term: string;
  definition: string;
  href: string;
}) {
  const [open, setOpen] = useState(false);
  const [flip, setFlip] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();

  function reveal() {
    // Flip the popover below the term when there isn't room above it.
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setFlip(rect.top < 190);
    setOpen(true);
  }

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={reveal}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={href}
        aria-describedby={open ? id : undefined}
        onFocus={reveal}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          // On touch devices the first tap should explain, not navigate.
          if (!open && window.matchMedia("(hover: none)").matches) {
            e.preventDefault();
            reveal();
          }
        }}
        className="border-b border-dashed border-accent/55 text-ink transition-colors hover:border-accent hover:text-accent"
      >
        {label}
      </Link>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-50 w-[min(19rem,72vw)] -translate-x-1/2 animate-fade-up rounded-lg border border-line-strong bg-raised p-3 text-left shadow-xl shadow-black/25 ${
            flip ? "top-[calc(100%+0.5rem)]" : "bottom-[calc(100%+0.5rem)]"
          }`}
        >
          <span className="eyebrow block">{term}</span>
          <span className="mt-1 block text-sm font-normal not-italic leading-relaxed text-muted">
            {definition}
          </span>
        </span>
      )}
    </span>
  );
}
