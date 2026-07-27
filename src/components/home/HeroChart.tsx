"use client";

import { PriceChart } from "@/components/chart/ChartBlock";

/**
 * The landing hero shows the exact thing the course teaches: a chart with the
 * structure named. It's the value proposition rendered rather than described.
 */
export function HeroChart() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="eyebrow">Reading structure</span>
        <span className="flex items-center gap-1.5 font-mono text-2xs text-faint">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-up" aria-hidden />
          generated sample
        </span>
      </div>
      <div className="px-3 pt-3">
        <PriceChart
          spec={{
            scenario: "breakout",
            seed: 88,
            bars: 115,
            symbol: "VRDN",
            timeframe: "1D",
            height: 300,
            showVolume: true,
            levels: [
              { anchor: "price.resistance", label: "resistance", kind: "resistance" },
              { anchor: "price.support", label: "support", kind: "support" },
            ],
            markers: [
              { anchor: "bar.breakout", text: "break + volume", position: "below", kind: "up" },
              { anchor: "bar.retest", text: "retest holds", position: "below", kind: "neutral" },
            ],
          }}
        />
      </div>
      <p className="border-t border-line bg-raised/50 px-4 py-2.5 text-xs leading-relaxed text-muted">
        Two levels price kept reacting to, a break on expanding volume, then a retest that held.
        By the end of the Chart Reading track you&rsquo;ll mark this yourself — and know when
        the same setup is a trap.
      </p>
    </div>
  );
}
