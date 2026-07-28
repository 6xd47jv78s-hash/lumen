"use client";

import { useCallback, useState } from "react";
import { LiveStatus } from "@/components/live/LiveStatus";
import { useLive } from "@/hooks/useLive";
import { getLiveCryptoQuotes, type LiveQuote } from "@/lib/live/crypto";
import { getLiveFxQuote } from "@/lib/live/fx";
import { firstWorking } from "@/lib/live/http";
import type { Quote } from "@/lib/market/quotes";

/**
 * Regime context, not a recommendation. Live where a free keyless provider
 * exists (crypto, FX); the sample rows stay for the instruments that would need
 * a paid key — and are labelled as samples rather than quietly mixed in with
 * real numbers.
 */

/** Editorial notes stay in the code — a price feed can't tell you what to make
 *  of a number, and this is the part that makes the bar educational. */
const MEANING: Record<string, string> = {
  BTC: "The high-beta risk asset. It usually moves the same way as equities, only further.",
  ETH: "Moves with bitcoin most of the time; divergence between them says something about crypto-specific flows.",
  SOL: "Higher beta again. In a risk-off move, the smaller the asset, the harder it falls.",
  "EUR/USD": "The most-traded pair in the world. It's really a bet on the ECB's rate path against the Fed's.",
};

export function SnapshotBar({
  quotes: sampleQuotes,
  isLive: sampleIsLive,
  asOf,
}: {
  quotes: Quote[];
  isLive: boolean;
  asOf: string;
}) {
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(
    () =>
      firstWorking<LiveQuote[]>([
        {
          name: "CoinGecko + ECB",
          load: async () => {
            // FX is a bonus: if only crypto answers, show crypto rather than
            // failing the whole bar.
            const [crypto, fx] = await Promise.allSettled([
              getLiveCryptoQuotes(),
              getLiveFxQuote("EUR/USD"),
            ]);
            if (crypto.status !== "fulfilled") throw new Error("no crypto quotes");
            return [
              ...crypto.value.data,
              ...(fx.status === "fulfilled" ? [fx.value.data] : []),
            ];
          },
        },
      ]),
    [],
  );

  const state = useLive<LiveQuote[]>(load, { refreshMs: 60_000 });

  const rows: (Quote & { live: boolean })[] = state.data
    ? state.data.map((q) => ({
        symbol: q.symbol,
        name: q.name,
        last: q.last,
        changePct: q.changePct,
        isRate: false,
        meaning: MEANING[q.symbol] ?? "",
        live: true,
      }))
    : sampleQuotes.map((q) => ({ ...q, live: sampleIsLive }));

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
        <span className="eyebrow">Market snapshot</span>
        {!state.data && !sampleIsLive && (
          <span className="rounded border border-signal/50 px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider text-signal">
            Sample data
          </span>
        )}
        <span className="ml-auto">
          <LiveStatus state={state} fallbackLabel={asOf} />
        </span>
      </div>

      <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {rows.map((q, i) => {
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
                  : q.last.toLocaleString(undefined, {
                      maximumFractionDigits: q.last < 10 ? 4 : 2,
                    })}
              </p>
              <p className="mt-0.5 text-xs text-muted">{q.name}</p>
              {expanded && q.meaning && (
                <p className="mt-2 animate-fade-up border-t border-line pt-2 text-xs leading-relaxed text-faint">
                  {q.meaning}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <p className="border-t border-line bg-raised/40 px-4 py-2.5 text-xs leading-relaxed text-faint">
        {state.data
          ? "Live prices from free public endpoints. Context for reading everything else — which regime you're in. Not a recommendation, and not a reason to act."
          : "Illustrative levels, not live prices — the live providers didn't answer. The bar's job is regime context, not recommendations."}
      </p>
    </section>
  );
}
