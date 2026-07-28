import type { Candle, Series } from "@/lib/market/types";
import type { LiveQuote } from "./crypto";
import { fetchJson, LiveDataError, type LiveResult } from "./http";

/**
 * Stock and index data.
 *
 * This is the one dataset with no free keyless provider, which is why it only
 * appears when the site runs on a Node host with a private key. On the static
 * build these endpoints don't exist and the UI says so, rather than shipping a
 * key to the browser where anyone could read it.
 *
 * Parsers live here (pure, testable); the fetching happens in the route handler
 * so the key never crosses into client code.
 */

export const STOCK_SYMBOLS = {
  SPY: "S&P 500 ETF",
  QQQ: "Nasdaq 100 ETF",
  AAPL: "Apple",
  MSFT: "Microsoft",
  NVDA: "Nvidia",
} as const;

export type StockSymbol = keyof typeof STOCK_SYMBOLS;

export function isStockSymbol(value: string): value is StockSymbol {
  return value in STOCK_SYMBOLS;
}

/* ------------------------------------------------------- twelve data --- */

interface TwelveDataValue {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

export interface TwelveDataSeries {
  status?: string;
  message?: string;
  values?: TwelveDataValue[];
}

/**
 * Twelve Data returns newest-first with every number as a string, and reports
 * errors with HTTP 200 and `status: "error"` — so a naive parse yields a
 * silently reversed chart, or an empty one with no explanation.
 */
export function parseTwelveDataSeries(json: TwelveDataSeries): Series {
  if (json.status === "error") {
    throw new Error(json.message ?? "Twelve Data reported an error");
  }

  const candles: Candle[] = [];
  const volumes = [];

  for (const row of json.values ?? []) {
    const time = Math.floor(Date.parse(`${row.datetime.replace(" ", "T")}Z`) / 1000);
    const open = Number(row.open);
    const high = Number(row.high);
    const low = Number(row.low);
    const close = Number(row.close);
    if (!Number.isFinite(time) || ![open, high, low, close].every(Number.isFinite)) continue;

    candles.push({ time, open, high, low, close });
    const volume = Number(row.volume);
    volumes.push({ time, value: Number.isFinite(volume) ? volume : 0, up: close >= open });
  }

  // Oldest first — the response is the other way round.
  candles.reverse();
  volumes.reverse();

  // Volume is optional on some plans; an all-zero pane would be a lie.
  const hasVolume = volumes.some((v) => v.value > 0);
  return { candles, volumes: hasVolume ? volumes : [], anchors: {} };
}

export interface TwelveDataQuote {
  symbol?: string;
  name?: string;
  close?: string;
  percent_change?: string;
  status?: string;
  message?: string;
}

export function parseTwelveDataQuote(json: TwelveDataQuote): LiveQuote {
  if (json.status === "error") {
    throw new Error(json.message ?? "Twelve Data reported an error");
  }
  const last = Number(json.close);
  if (!Number.isFinite(last)) throw new Error("Twelve Data returned no price");

  const symbol = json.symbol ?? "";
  return {
    symbol,
    name:
      isStockSymbol(symbol) ? STOCK_SYMBOLS[symbol] : (json.name ?? symbol),
    last,
    changePct: Number(json.percent_change) || 0,
  };
}

/** Chart interval → the provider's own interval vocabulary. */
export const TWELVE_DATA_INTERVAL: Record<string, string> = {
  "1h": "1h",
  "4h": "4h",
  "1d": "1day",
};

/* ------------------------------------------------------------- client --- */


/** Distinguishes "this host has no server" from "the provider failed". */
export class StocksUnavailableError extends Error {
  constructor(readonly reason: "no-server" | "no-key") {
    super(
      reason === "no-server"
        ? "Live stock data needs a server. This build is a static export."
        : "Live stock data needs a TWELVE_DATA_KEY on the server.",
    );
    this.name = "StocksUnavailableError";
  }
}

/**
 * Stocks always go through our own API route — never direct from the browser —
 * because every provider needs a key and a key in client code is public.
 *
 * A 404 means the route isn't in this build (static export); a 501 means the
 * server is there but unconfigured. Both are expected states with their own
 * message, not errors to bury in a generic failure.
 */
export async function getLiveStock(
  symbol: StockSymbol,
  interval: string,
): Promise<LiveResult<Series>> {
  try {
    const json = await fetchJson<{ series: Series; provider: string }>(
      `/api/market/candles?symbol=${symbol}&interval=${interval}`,
      "MarketLab server",
    );
    return {
      data: json.series,
      provider: json.provider ?? "MarketLab server",
      attempts: [],
      fetchedAt: Date.now(),
    };
  } catch (err) {
    if (err instanceof LiveDataError) {
      if (err.status === 404) throw new StocksUnavailableError("no-server");
      if (err.status === 501) throw new StocksUnavailableError("no-key");
    }
    throw err;
  }
}

export async function getLiveStockQuotes(): Promise<LiveResult<LiveQuote[]>> {
  try {
    const json = await fetchJson<{ quotes: LiveQuote[]; provider: string }>(
      "/api/market/quotes",
      "MarketLab server",
    );
    return {
      data: json.quotes,
      provider: json.provider ?? "MarketLab server",
      attempts: [],
      fetchedAt: Date.now(),
    };
  } catch (err) {
    if (err instanceof LiveDataError && (err.status === 404 || err.status === 501)) {
      throw new StocksUnavailableError(err.status === 404 ? "no-server" : "no-key");
    }
    throw err;
  }
}
