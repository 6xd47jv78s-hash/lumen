import { fetchJson, firstWorking, type LiveResult } from "./http";
import type { LiveQuote } from "./crypto";

/**
 * Live FX from the European Central Bank's published reference rates, via
 * Frankfurter — free, keyless, CORS-open.
 *
 * One honest limitation the UI has to reflect: these are daily reference rates,
 * one value per day, not OHLC. There is no high, low or volume to draw, so FX
 * renders as a line rather than candles. Inventing a candle from a single price
 * would be fabricating three of its four numbers.
 */

export const FX_PAIRS = {
  "EUR/USD": { base: "EUR", quote: "USD", label: "Euro / US dollar" },
  "GBP/USD": { base: "GBP", quote: "USD", label: "Sterling / US dollar" },
  "USD/JPY": { base: "USD", quote: "JPY", label: "US dollar / Japanese yen" },
} as const;

export type FxPair = keyof typeof FX_PAIRS;

export interface FxPoint {
  /** Unix seconds. */
  time: number;
  value: number;
}

interface FrankfurterSeries {
  base: string;
  rates: Record<string, Record<string, number>>;
}

/** Frankfurter returns an unordered date map; charts need ascending time. */
export function parseFrankfurterSeries(json: FrankfurterSeries, quote: string): FxPoint[] {
  const out: FxPoint[] = [];
  for (const [date, rates] of Object.entries(json.rates ?? {})) {
    const value = rates?.[quote];
    if (!Number.isFinite(value)) continue;
    const time = Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
    if (!Number.isFinite(time)) continue;
    out.push({ time, value });
  }
  return out.sort((a, b) => a.time - b.time);
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
}

export async function getLiveFx(pair: FxPair, days = 180): Promise<LiveResult<FxPoint[]>> {
  const { base, quote } = FX_PAIRS[pair];
  const range = `${isoDaysAgo(days)}..${isoDaysAgo(0)}`;

  return firstWorking<FxPoint[]>([
    {
      name: "Frankfurter (ECB)",
      load: async () => {
        const json = await fetchJson<FrankfurterSeries>(
          `https://api.frankfurter.app/${range}?from=${base}&to=${quote}`,
          "Frankfurter",
        );
        const points = parseFrankfurterSeries(json, quote);
        if (points.length < 2) throw new Error("Frankfurter returned too few points");
        return points;
      },
    },
  ]);
}

interface FrankfurterLatest {
  rates: Record<string, number>;
}

export function toFxQuote(pair: FxPair, points: FxPoint[]): LiveQuote | null {
  if (points.length < 2) return null;
  const last = points[points.length - 1].value;
  const prev = points[points.length - 2].value;
  return {
    symbol: pair,
    name: FX_PAIRS[pair].label,
    last,
    changePct: ((last - prev) / prev) * 100,
  };
}

export async function getLiveFxQuote(pair: FxPair): Promise<LiveResult<LiveQuote>> {
  const { base, quote } = FX_PAIRS[pair];
  return firstWorking<LiveQuote>([
    {
      name: "Frankfurter (ECB)",
      load: async () => {
        // Two calls would be wasteful; the short series gives the previous close
        // needed for a change figure as well as the latest rate.
        const json = await fetchJson<FrankfurterSeries>(
          `https://api.frankfurter.app/${isoDaysAgo(7)}..${isoDaysAgo(0)}?from=${base}&to=${quote}`,
          "Frankfurter",
        );
        const result = toFxQuote(pair, parseFrankfurterSeries(json, quote));
        if (!result) throw new Error("Frankfurter returned too few points");
        return result;
      },
    },
  ]);
}

export function parseFrankfurterLatest(json: FrankfurterLatest, quote: string): number | null {
  const value = json.rates?.[quote];
  return Number.isFinite(value) ? value : null;
}
