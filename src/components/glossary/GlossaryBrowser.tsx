"use client";

import { useMemo, useState } from "react";
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  slugifyTerm,
  type GlossaryCategory,
} from "@/content/glossary";

export function GlossaryBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return (
        e.term.toLowerCase().includes(q) ||
        (e.aliases ?? []).some((a) => a.toLowerCase().includes(q)) ||
        e.definition.toLowerCase().includes(q)
      );
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [query, category]);

  return (
    <>
      <div className="sticky top-14 z-20 -mx-4 mt-7 border-b border-line bg-base/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms and definitions…"
            aria-label="Search the glossary"
            className="w-full rounded-md border border-line bg-surface py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-faint focus:border-accent"
          />
        </div>

        <div className="thin-scroll mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {(["all", ...GLOSSARY_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                category === c
                  ? "border-accent/50 bg-accent-soft text-ink"
                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {c === "all" ? "All" : c}
              <span className="ml-1.5 font-mono text-2xs text-faint tnum">
                {c === "all" ? GLOSSARY.length : GLOSSARY.filter((e) => e.category === c).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-5 font-mono text-2xs text-faint tnum">
        {results.length} {results.length === 1 ? "term" : "terms"}
      </p>

      <div className="mt-3 space-y-2.5">
        {results.map((entry) => (
          <article
            key={entry.term}
            id={slugifyTerm(entry.term)}
            className="scroll-mt-40 rounded-lg border border-line bg-surface p-4 target:border-accent/60 target:bg-accent-soft/40"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-base font-semibold tracking-tight text-ink">{entry.term}</h2>
              <span className="eyebrow">{entry.category}</span>
              {entry.aliases && entry.aliases.length > 0 && (
                <span className="font-mono text-2xs text-faint">
                  also: {entry.aliases.slice(0, 3).join(", ")}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{entry.definition}</p>
            {entry.detail && (
              <p className="mt-2 border-l-2 border-line-strong pl-3 text-sm leading-relaxed text-muted/90">
                {entry.detail}
              </p>
            )}
            {entry.related && entry.related.length > 0 && (
              <p className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="eyebrow">See also</span>
                {entry.related.map((r) => (
                  <a
                    key={r}
                    href={`#${slugifyTerm(r)}`}
                    onClick={() => {
                      setQuery("");
                      setCategory("all");
                    }}
                    className="rounded border border-line bg-raised px-1.5 py-0.5 text-2xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    {r}
                  </a>
                ))}
              </p>
            )}
          </article>
        ))}

        {results.length === 0 && (
          <p className="rounded-lg border border-line bg-surface px-4 py-10 text-center text-sm text-muted">
            No terms match &ldquo;{query}&rdquo;. Try a shorter search.
          </p>
        )}
      </div>
    </>
  );
}
