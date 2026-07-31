"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchHit, SearchKind } from "@/lib/content/search";

const KIND_LABEL: Record<SearchKind, string> = {
  lesson: "Lesson",
  term: "Term",
  track: "Track",
  exercise: "Exercise",
  page: "Page",
};

const SUGGESTIONS = ["position sizing", "candlestick", "support", "volume", "leverage"];

/**
 * Site-wide search over lessons, glossary terms, tracks, exercises and pages.
 *
 * Opened from the nav button, or with ⌘K / Ctrl-K, or "/" — the last of those
 * being what anyone who reads documentation will try first.
 */
type SearchFn = (query: string, limit?: number) => SearchHit[];

/**
 * The index carries every lesson heading and all 130 glossary entries. Statically
 * importing it put that on the layout chunk, which every page pays for whether
 * or not anyone searches — so it loads on first open instead. In practice the
 * chunk arrives while the reader is still typing the first character.
 */
let searchModule: Promise<SearchFn> | null = null;
function loadSearch(): Promise<SearchFn> {
  searchModule ??= import("@/lib/content/search").then((m) => m.search);
  return searchModule;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [searchFn, setSearchFn] = useState<SearchFn | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  const hits = useMemo(
    () => (searchFn ? searchFn(query) : []),
    [searchFn, query],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    // Send focus back where it came from, so a keyboard user doesn't get
    // dumped at the top of the document.
    openerRef.current?.focus();
    openerRef.current = null;
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  // Global shortcuts. "/" is ignored while the caret is in another field,
  // otherwise it would swallow the character the reader meant to type.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el?.isContentEditable === true;

      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openerRef.current = document.activeElement as HTMLElement;
        setOpen((v) => !v);
      } else if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        openerRef.current = document.activeElement as HTMLElement;
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Fetch the index as soon as the dialog opens. `setSearchFn` takes an updater
  // function, so the function being stored has to be wrapped to avoid React
  // calling it as one.
  useEffect(() => {
    if (!open || searchFn) return;
    let live = true;
    loadSearch().then((fn) => {
      if (live) setSearchFn(() => fn);
    });
    return () => {
      live = false;
    };
  }, [open, searchFn]);

  // Lock the page behind the dialog so a scroll gesture doesn't move the
  // document underneath the results.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row in view when moving through a long result list
  // with the keyboard.
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (hits.length ? (i + 1) % hits.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (hits.length ? (i - 1 + hits.length) % hits.length : 0));
    } else if (e.key === "Enter" && hits[active]) {
      e.preventDefault();
      go(hits[active].doc.href);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          openerRef.current = e.currentTarget;
          setOpen(true);
        }}
        className="btn-ghost h-8 gap-2 !px-2.5 text-muted sm:!px-3"
        aria-label="Search the site"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <span className="hidden text-xs lg:inline">Search</span>
        <kbd className="hidden rounded border border-line-strong px-1 font-mono text-2xs text-faint lg:inline">
          /
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-base/70 px-4 pt-[10vh] backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search MarketLab"
            className="flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-line-strong bg-surface shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-faint" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search lessons, terms and exercises…"
                aria-label="Search lessons, terms and exercises"
                role="combobox"
                aria-expanded={hits.length > 0}
                aria-controls="search-results"
                aria-activedescendant={hits[active] ? `search-hit-${active}` : undefined}
                autoComplete="off"
                className="w-full border-0 bg-transparent py-3.5 text-[0.95rem] text-ink placeholder:text-faint focus:outline-none focus:ring-0"
              />
              <button
                onClick={close}
                className="shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-2xs text-faint transition-colors hover:text-ink"
              >
                esc
              </button>
            </div>

            {query.trim() === "" ? (
              <div className="px-4 py-5">
                <p className="eyebrow">Try</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setQuery(s);
                        inputRef.current?.focus();
                      }}
                      className="rounded-md border border-line bg-raised px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-line-strong hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-faint">
                  Searches lesson titles, section headings, glossary terms and exercises — not full
                  lesson prose, which would match nearly every query.
                </p>
              </div>
            ) : !searchFn ? (
              // Distinct from "no results" on purpose — telling someone their
              // query matched nothing when the index simply hasn't arrived is a
              // lie they would act on by rephrasing a perfectly good query.
              <p className="px-4 py-10 text-center text-sm text-faint">Loading the index…</p>
            ) : hits.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted">
                Nothing matches &ldquo;{query}&rdquo;. Try a shorter or more general word.
              </p>
            ) : (
              <ul
                ref={listRef}
                id="search-results"
                role="listbox"
                aria-label="Search results"
                className="thin-scroll min-h-0 flex-1 overflow-y-auto py-1.5"
              >
                {hits.map((hit, i) => (
                  <li key={hit.doc.id} role="none">
                    <button
                      id={`search-hit-${i}`}
                      role="option"
                      aria-selected={i === active}
                      onClick={() => go(hit.doc.href)}
                      onMouseMove={() => setActive(i)}
                      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === active ? "bg-accent-soft" : ""
                      }`}
                    >
                      <span
                        className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 font-mono text-2xs ${
                          i === active
                            ? "border-accent/50 text-accent"
                            : "border-line text-faint"
                        }`}
                      >
                        {KIND_LABEL[hit.doc.kind]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {hit.doc.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-faint">
                          {hit.doc.context}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Keyboard hints only where there is a keyboard to hint at. */}
            <div className="hidden items-center gap-4 border-t border-line px-4 py-2 font-mono text-2xs text-faint sm:flex">
              <span>↑↓ move</span>
              <span>↵ open</span>
              <span className="ml-auto">⌘K or /</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
