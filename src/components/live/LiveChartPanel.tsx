"use client";

import { useCallback, useMemo, useState } from "react";
import { PriceChart } from "@/components/chart/ChartBlock";
import { LiveFailureNote, LiveStatus } from "./LiveStatus";
import { useLive } from "@/hooks/useLive";
import {
  CRYPTO_MARKETS,
  getLiveCrypto,
  type CryptoSymbol,
  type LiveInterval,
} from "@/lib/live/crypto";
import { FX_PAIRS, getLiveFx, type FxPair } from "@/lib/live/fx";
import {
  STOCK_SYMBOLS,
  StocksUnavailableError,
  getLiveStock,
  type StockSymbol,
} from "@/lib/live/stocks";
import { getSeries, sma } from "@/lib/market/generate";
import type { Series } from "@/lib/market/types";

type Market =
  | { kind: "crypto"; symbol: CryptoSymbol }
  | { kind: "fx"; pair: FxPair }
  | { kind: "stock"; symbol: StockSymbol };

const MARKETS: Market[] = [
  { kind: "crypto", symbol: "BTC" },
  { kind: "crypto", symbol: "ETH" },
  { kind: "crypto", symbol: "SOL" },
  { kind: "fx", pair: "EUR/USD" },
  { kind: "fx", pair: "GBP/USD" },
  { kind: "fx", pair: "USD/JPY" },
  ...(Object.keys(STOCK_SYMBOLS) as StockSymbol[]).map(
    (symbol) => ({ kind: "stock", symbol }) as const,
  ),
];

const INTERVALS: LiveInterval[] = ["1h", "4h", "1d"];

function marketKey(m: Market) {
  return m.kind === "fx" ? m.pair : m.symbol;
}

export function LiveChartPanel() {
  const [market, setMarket] = useState<Market>(MARKETS[0]);
  const [interval, setInterval] = useState<LiveInterval>("1d");
  const [showMa, setShowMa] = useState(true);

  const isCrypto = market.kind === "crypto";
  const hasCandles = market.kind !== "fx";

  const load = useCallback(async () => {
    if (market.kind === "crypto") return getLiveCrypto(market.symbol, interval);
    // Stocks need a key, so they always go through our own server route.
    if (market.kind === "stock") return getLiveStock(market.symbol, interval);
    // FX reference rates are daily; the interval selector doesn't apply.
    const result = await getLiveFx(market.pair, 180);
    return {
      ...result,
      data: {
        // One published rate per day means no high, low or volume exists.
        // Synthesising them would be inventing three numbers out of four, so
        // this renders strictly as a line (see `asLine` below).
        candles: result.data.map((p) => ({
          time: p.time,
          open: p.value,
          high: p.value,
          low: p.value,
          close: p.value,
        })),
        volumes: [],
        anchors: {},
      } satisfies Series,
    };
  }, [market, interval]);

  const state = useLive<Series>(load, {
    refreshMs: isCrypto ? 60_000 : market.kind === "stock" ? 5 * 60_000 : 15 * 60_000,
  });

  // Stocks are unavailable rather than broken when there is no server or key —
  // a setup gap deserves a different message from a provider outage.
  const unavailable =
    state.error?.includes("needs a server")
      ? "no-server"
      : state.error?.includes("TWELVE_DATA_KEY")
        ? "no-key"
        : null;

  // A generated series stands in when live data can't load, so the page still
  // demonstrates something rather than showing an empty frame.
  const fallback = useMemo(() => getSeries("uptrend", 71, 110), []);
  const series = state.data ?? fallback;
  const isFallback = !state.data;

  const label =
    market.kind === "crypto"
      ? `${market.symbol}/USD`
      : market.kind === "stock"
        ? market.symbol
        : market.pair;
  const name =
    market.kind === "crypto"
      ? CRYPTO_MARKETS[market.symbol].label
      : market.kind === "stock"
        ? STOCK_SYMBOLS[market.symbol]
        : FX_PAIRS[market.pair].label;

  const last = series.candles[series.candles.length - 1]?.close;
  const first = series.candles[0]?.close;
  const changePct = last && first ? ((last - first) / first) * 100 : 0;
  const maPeriods = showMa && series.candles.length > 60 ? [20, 50] : undefined;

  // When live data failed, the chart shows a generated stand-in. Labelling that
  // stand-in "BTC/USD" would put a real ticker above prices that were never
  // bitcoin's — so the symbol and the change figure both say what they are.
  const chartSymbol = isFallback ? `${label} — SAMPLE DATA` : label;

  return (
    <section className="rounded-lg border border-line bg-surface">
      <header className="border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-ink">{label}</h2>
            <p className="text-xs text-faint">{name}</p>
          </div>
          <div className="ml-auto">
            <LiveStatus state={state} fallbackLabel="sample chart" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {MARKETS.map((m) => {
            const active = marketKey(m) === marketKey(market);
            return (
              <button
                key={marketKey(m)}
                onClick={() => setMarket(m)}
                className={`rounded-md border px-2.5 py-1.5 font-mono text-2xs transition-colors ${
                  active
                    ? "border-accent/50 bg-accent-soft text-ink"
                    : "border-line bg-raised text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {marketKey(m)}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {hasCandles ? (
            INTERVALS.map((i) => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                className={`rounded-md border px-2.5 py-1.5 font-mono text-2xs transition-colors ${
                  interval === i
                    ? "border-accent/50 bg-accent-soft text-ink"
                    : "border-line bg-raised text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {i}
              </button>
            ))
          ) : (
            <span className="font-mono text-2xs text-faint">
              daily ECB reference rates — one price per day, so no candles
            </span>
          )}

          {hasCandles && (
            <button
              onClick={() => setShowMa((v) => !v)}
              className={`rounded-md border px-2.5 py-1.5 font-mono text-2xs transition-colors ${
                showMa
                  ? "border-accent/50 bg-accent-soft text-ink"
                  : "border-line bg-raised text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              MA 20/50
            </button>
          )}

          {isFallback ? (
            <span className="ml-auto font-mono text-xs text-signal">
              not live — figures below are generated
            </span>
          ) : (
            <span
              className={`ml-auto font-mono text-xs tnum ${changePct >= 0 ? "text-up" : "text-down"}`}
            >
              {changePct >= 0 ? "+" : ""}
              {changePct.toFixed(2)}% over the window
            </span>
          )}
        </div>
      </header>

      <div className="px-3 pt-3">
        <PriceChart
          key={`${marketKey(market)}-${interval}-${isFallback}`}
          series={series}
          interactive
          spec={{
            scenario: "uptrend",
            seed: 1,
            symbol: chartSymbol,
            timeframe: hasCandles ? interval : "1D",
            height: 380,
            showVolume: hasCandles,
            asLine: !hasCandles,
            ma: maPeriods,
          }}
        />
      </div>

      <div className="px-4 pb-4">
        {unavailable ? (
          <div className="rounded-md border border-line-strong bg-raised px-3.5 py-3">
            <p className="eyebrow">Stocks need a server</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {unavailable === "no-server" ? (
                <>
                  Crypto and FX have free keyless providers, so they work anywhere. Every stock and
                  index provider requires an API key — and on a static host that key would be
                  readable by every visitor. This build is static, so the stock endpoint
                  isn&rsquo;t here.
                </>
              ) : (
                <>
                  The server is running but has no market-data key configured. Set{" "}
                  <code className="rounded border border-line bg-surface px-1 py-0.5 font-mono text-2xs">
                    TWELVE_DATA_KEY
                  </code>{" "}
                  in the deployment&rsquo;s environment variables and redeploy.
                </>
              )}
            </p>
          </div>
        ) : (
          <LiveFailureNote state={state} />
        )}
        {state.status === "live" && !unavailable && (
          <p className="mt-2 text-xs leading-relaxed text-faint">
            Real market data, drawn with the same chart the lessons use — so the structure you
            learned to read is the structure you&rsquo;re looking at. Nothing here is a
            recommendation.
            {series.volumes.length === 0 && hasCandles && (
              <> This provider doesn&rsquo;t supply volume, so the volume pane is hidden.</>
            )}
          </p>
        )}
      </div>
    </section>
  );
}

export { sma };
