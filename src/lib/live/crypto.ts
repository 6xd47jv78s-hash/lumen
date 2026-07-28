import type { Candle, Series, VolumeBar } from "@/lib/market/types";
import { fetchJson, firstWorking, type LiveResult } from "./http";

/**
 * Live crypto candles from keyless public endpoints.
 *
 * Provider order is deliberate:
 *   1. Binance — returns OHLC *and* volume in one call, which the volume
 *      lessons need. Its weakness is jurisdiction: api.binance.com answers 451
 *      to some regions, so it can't be the only source.
 *   2. CoinGecko — no volume in the OHLC endpoint, but far fewer geographic
 *      restrictions. The chart drops its volume pane rather than inventing one.
 *
 * Neither needs an API key.
 */

export type CryptoSymbol = "BTC" | "ETH" | "SOL";
export type LiveInterval = "1h" | "4h" | "1d";

interface Market {
  label: string;
  binance: string;
  coingecko: string;
}

export const CRYPTO_MARKETS: Record<CryptoSymbol, Market> = {
  BTC: { label: "Bitcoin", binance: "BTCUSDT", coingecko: "bitcoin" },
  ETH: { label: "Ethereum", binance: "ETHUSDT", coingecko: "ethereum" },
  SOL: { label: "Solana", binance: "SOLUSDT", coingecko: "solana" },
};

/** CoinGecko only accepts a fixed set of day windows. */
const COINGECKO_DAYS: Record<LiveInterval, number> = { "1h": 1, "4h": 7, "1d": 90 };
const BINANCE_LIMIT: Record<LiveInterval, number> = { "1h": 168, "4h": 180, "1d": 200 };

/* ------------------------------------------------------------- binance --- */

/** `[openTime, open, high, low, close, volume, closeTime, ...]`, values as strings. */
type BinanceKline = [number, string, string, string, string, string, number, ...unknown[]];

export function parseBinanceKlines(rows: BinanceKline[]): Series {
  const candles: Candle[] = [];
  const volumes: VolumeBar[] = [];

  for (const row of rows) {
    const time = Math.floor(row[0] / 1000);
    const open = Number(row[1]);
    const high = Number(row[2]);
    const low = Number(row[3]);
    const close = Number(row[4]);
    const volume = Number(row[5]);
    // A malformed row should drop out rather than poison the whole series.
    if (![open, high, low, close].every(Number.isFinite)) continue;

    candles.push({ time, open, high, low, close });
    volumes.push({ time, value: volume, up: close >= open });
  }

  return { candles, volumes, anchors: {} };
}

async function loadBinance(market: Market, interval: LiveInterval): Promise<Series> {
  const url =
    `https://api.binance.com/api/v3/klines?symbol=${market.binance}` +
    `&interval=${interval}&limit=${BINANCE_LIMIT[interval]}`;
  const rows = await fetchJson<BinanceKline[]>(url, "Binance");
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Binance returned no candles");
  }
  return parseBinanceKlines(rows);
}

/* ----------------------------------------------------------- coingecko --- */

/** `[timestampMs, open, high, low, close]` — no volume on this endpoint. */
type CoingeckoOhlc = [number, number, number, number, number];

export function parseCoingeckoOhlc(rows: CoingeckoOhlc[]): Series {
  const candles: Candle[] = [];
  for (const [ms, open, high, low, close] of rows) {
    if (![open, high, low, close].every(Number.isFinite)) continue;
    candles.push({ time: Math.floor(ms / 1000), open, high, low, close });
  }
  // Volume is genuinely unavailable here, so return none rather than a guess.
  return { candles, volumes: [], anchors: {} };
}

async function loadCoingecko(market: Market, interval: LiveInterval): Promise<Series> {
  const url =
    `https://api.coingecko.com/api/v3/coins/${market.coingecko}/ohlc` +
    `?vs_currency=usd&days=${COINGECKO_DAYS[interval]}`;
  const rows = await fetchJson<CoingeckoOhlc[]>(url, "CoinGecko");
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("CoinGecko returned no candles");
  }
  return parseCoingeckoOhlc(rows);
}

/* -------------------------------------------------------------- public --- */

export async function getLiveCrypto(
  symbol: CryptoSymbol,
  interval: LiveInterval,
): Promise<LiveResult<Series>> {
  const market = CRYPTO_MARKETS[symbol];
  return firstWorking<Series>([
    { name: "Binance", load: () => loadBinance(market, interval) },
    { name: "CoinGecko", load: () => loadCoingecko(market, interval) },
  ]);
}

/* -------------------------------------------------------------- quotes --- */

export interface LiveQuote {
  symbol: string;
  name: string;
  last: number;
  changePct: number;
}

type CoingeckoPrices = Record<string, { usd?: number; usd_24h_change?: number }>;

export function parseCoingeckoPrices(json: CoingeckoPrices): LiveQuote[] {
  const out: LiveQuote[] = [];
  for (const [symbol, market] of Object.entries(CRYPTO_MARKETS)) {
    const row = json[market.coingecko];
    if (!row || !Number.isFinite(row.usd)) continue;
    out.push({
      symbol,
      name: market.label,
      last: row.usd as number,
      changePct: Number.isFinite(row.usd_24h_change) ? (row.usd_24h_change as number) : 0,
    });
  }
  return out;
}

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

export function parseBinanceTickers(rows: BinanceTicker[]): LiveQuote[] {
  const bySymbol = new Map(rows.map((r) => [r.symbol, r]));
  const out: LiveQuote[] = [];
  for (const [symbol, market] of Object.entries(CRYPTO_MARKETS)) {
    const row = bySymbol.get(market.binance);
    if (!row) continue;
    const last = Number(row.lastPrice);
    if (!Number.isFinite(last)) continue;
    out.push({
      symbol,
      name: market.label,
      last,
      changePct: Number(row.priceChangePercent) || 0,
    });
  }
  return out;
}

export async function getLiveCryptoQuotes(): Promise<LiveResult<LiveQuote[]>> {
  const ids = Object.values(CRYPTO_MARKETS)
    .map((m) => m.coingecko)
    .join(",");
  const symbols = JSON.stringify(Object.values(CRYPTO_MARKETS).map((m) => m.binance));

  return firstWorking<LiveQuote[]>([
    {
      name: "CoinGecko",
      load: async () => {
        const json = await fetchJson<CoingeckoPrices>(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          "CoinGecko",
        );
        const quotes = parseCoingeckoPrices(json);
        if (!quotes.length) throw new Error("CoinGecko returned no usable prices");
        return quotes;
      },
    },
    {
      name: "Binance",
      load: async () => {
        const rows = await fetchJson<BinanceTicker[]>(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
          "Binance",
        );
        const quotes = parseBinanceTickers(rows);
        if (!quotes.length) throw new Error("Binance returned no usable prices");
        return quotes;
      },
    },
  ]);
}
