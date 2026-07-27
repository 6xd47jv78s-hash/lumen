export interface Quote {
  symbol: string;
  name: string;
  /** Last level. Formatted by the caller. */
  last: number;
  /** Percentage change on the session. */
  changePct: number;
  /** What this instrument tells a student about the regime. */
  meaning: string;
  /** Rendered as a percentage rather than a price (yields). */
  isRate?: boolean;
}

/**
 * Market snapshot integration point.
 *
 * The snapshot bar exists to answer one question a student should ask before
 * reading anything else: *what regime am I in?* It is context, never a
 * recommendation, and it deliberately shows the four instruments the Macro
 * track teaches you to read together — a broad index, the 10-year yield, the
 * dollar and bitcoin.
 *
 * Sample values are clearly badged in the UI. That badge is not decoration:
 * a number looks authoritative in a way a headline does not, so an unbadged
 * placeholder price would be actively misleading.
 *
 * To go live, implement `QuoteSource` against a provider (Finnhub, Twelve Data,
 * Alpha Vantage, Polygon) and swap the export. Nothing in the UI changes.
 */
export interface QuoteSource {
  list(): Promise<Quote[]>;
  readonly isLive: boolean;
  readonly label: string;
  /** Shown alongside the values so staleness is never hidden. */
  readonly asOf: string;
}

const SAMPLE: Quote[] = [
  {
    symbol: "SPX",
    name: "S&P 500",
    last: 5842.1,
    changePct: 0.42,
    meaning: "The broad risk gauge. Above its 200-day and rising is a different world from below and falling.",
  },
  {
    symbol: "US10Y",
    name: "10-year yield",
    last: 4.28,
    changePct: -1.15,
    isRate: true,
    meaning:
      "The market's live vote on future rates. Check this first when equities move and you don't know why.",
  },
  {
    symbol: "DXY",
    name: "Dollar index",
    last: 103.4,
    changePct: -0.18,
    meaning: "Strong dollar usually means risk-off, and it drags on commodities and emerging markets.",
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    last: 68420,
    changePct: 1.86,
    meaning:
      "The high-beta risk asset. It typically moves in the same direction as equities, only further.",
  },
];

const sampleSource: QuoteSource = {
  isLive: false,
  label: "Sample snapshot",
  asOf: "illustrative levels — not live prices",
  async list() {
    return SAMPLE;
  },
};

/*
 * Example live implementation:
 *
 * const liveSource: QuoteSource = {
 *   isLive: true,
 *   label: "Finnhub",
 *   asOf: "delayed 15 min",
 *   async list() {
 *     const symbols = ["^GSPC", "^TNX", "DX-Y.NYB", "BINANCE:BTCUSDT"];
 *     const rows = await Promise.all(symbols.map(fetchQuote));  // revalidate: 300
 *     return rows.map(mapToQuote);   // keep `meaning` editorial, not from the feed
 *   },
 * };
 */

export const quoteSource: QuoteSource = sampleSource;

export async function getQuotes(): Promise<Quote[]> {
  return quoteSource.list();
}
