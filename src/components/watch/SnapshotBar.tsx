"use client";

import { useState } from "react";
import type { Quote } from "@/lib/market/quotes";

/**
 * Regime context, not a recommendation. These are the four instruments the
 * Macro track teaches you to read together — if you can only glance at one
 * thing before reading a chart, this is it.
 */
export function SnapshotBar({
  quotes,
  isLive,
  asOf,
}: {
  quotes: Quote[];
  isLive: boolean;
  asOf: string;
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
        <span className="eyebrow">Market snapshot</span>
        {!isLive && (
          <span className="rounded border border-signal/50 px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider text-signal">
            Sample data
          </span>
        )}
        <span className="ml-auto font-mono text-2xs text-faint">{asOf}</span>
      </div>

      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {quotes.map((q, i) => {
          const up = q.changePct >= 0;
          const expanded = open === q.symbol;
          return (
            <button
              key={q.symbol}
              onClick={() => setOpen(expanded ? null : q.symbol)}
              aria-expanded={expanded}
              className={`px-4 py-3 text-left transition-colors hover:bg-raised/60 ${
                i > 0 ? "lg:border-l lg:border-line" : ""
              } ${i % 2 === 1 ? "sm:border-l sm:border-line" : ""}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-2xs text-faint">{q.symbol}</span>
                <span className={`font-mono text-2xs tnum ${up ? "text-up" : "text-down"}`}>
                  {up ? "▲" : "▼"} {Math.abs(q.changePct).toFixed(2)}%
                </span>
              </div>
              <p className="mt-1 font-mono text-lg text-ink tnum">
                {q.isRate
                  ? `${q.last.toFixed(2)}%`
                  : q.last.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              <p className="mt-0.5 text-xs text-muted">{q.name}</p>
              {expanded && (
                <p className="mt-2 animate-fade-up border-t border-line pt-2 text-xs leading-relaxed text-faint">
                  {q.meaning}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <p className="border-t border-line bg-raised/40 px-4 py-2.5 text-xs leading-relaxed text-faint">
        {isLive
          ? "Context for reading everything else — which regime you're in. Not a recommendation, and not a reason to act."
          : "These are illustrative levels, not live prices — the bar is wired to a swappable market-data source. Its job is regime context, not recommendations."}
      </p>
    </section>
  );
}
