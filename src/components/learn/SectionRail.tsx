"use client";

import { useEffect, useState } from "react";
import type { LessonSection } from "@/lib/content/headings";

/**
 * "On this page" rail.
 *
 * Lessons run to 800 words with six or more sections, and at wide viewports the
 * reading column left a few hundred pixels of dead space to its right. This
 * fills it with something useful: section navigation, plus a read-position
 * indicator so a long lesson doesn't feel unbounded.
 */
export function SectionRail({ sections }: { sections: LessonSection[] }) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    if (!sections.length) return;
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    // Track the last heading to have crossed the top of the viewport, rather
    // than whatever is merely intersecting — that keeps the highlight stable
    // when several short sections are on screen at once.
    const observer = new IntersectionObserver(
      () => {
        const cutoff = 140;
        let current = headings[0];
        for (const h of headings) {
          if (h.getBoundingClientRect().top <= cutoff) current = h;
        }
        setActive(current.id);
      },
      { rootMargin: "-130px 0px -70% 0px", threshold: [0, 1] },
    );
    for (const h of headings) observer.observe(h);
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 3) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="eyebrow">On this page</p>
      <ul className="mt-3 space-y-px border-l border-line">
        {sections.map((section) => {
          const current = section.id === active;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={current ? "true" : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-3 pr-2 leading-snug transition-colors ${
                  current
                    ? "border-accent font-medium text-ink"
                    : "border-transparent text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {section.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
