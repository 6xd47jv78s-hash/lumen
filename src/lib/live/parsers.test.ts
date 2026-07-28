import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseBinanceKlines,
  parseBinanceTickers,
  parseCoingeckoOhlc,
  parseCoingeckoPrices,
} from "./crypto";
import { parseFrankfurterSeries, toFxQuote } from "./fx";
import { matchLesson, parseGdelt, parseGdeltDate, parseMarketaux } from "./news";
import { parseTwelveDataQuote, parseTwelveDataSeries } from "./stocks";

/**
 * The network calls themselves can't be tested here — and honestly shouldn't
 * be, since a test that depends on a third-party endpoint being up fails for
 * reasons that have nothing to do with this code.
 *
 * What *is* worth pinning down is the mapping: every one of these providers
 * returns a differently-shaped payload, several of them stringly-typed, and a
 * silent misparse would put wrong prices on a chart while looking fine. The
 * fixtures below are recorded response shapes.
 */

describe("live data parsers", () => {
  describe("Binance klines", () => {
    // Real shape: numbers for times, strings for every price and volume.
    const fixture = [
      [1717200000000, "67000.10", "68500.00", "66800.55", "68210.30", "1234.56", 1717286399999, "x"],
      [1717286400000, "68210.30", "69100.00", "67900.00", "68950.10", "2345.67", 1717372799999, "x"],
    ] as never;

    it("converts strings to numbers and milliseconds to seconds", () => {
      const { candles, volumes } = parseBinanceKlines(fixture);
      assert.equal(candles.length, 2);
      assert.deepEqual(candles[0], {
        time: 1717200000,
        open: 67000.1,
        high: 68500,
        low: 66800.55,
        close: 68210.3,
      });
      assert.equal(volumes[0].value, 1234.56);
      assert.equal(volumes[0].up, true, "close above open should mark the bar up");
      assert.equal(volumes[1].up, true);
    });

    it("keeps OHLC invariants that the chart depends on", () => {
      for (const c of parseBinanceKlines(fixture).candles) {
        assert.ok(c.high >= Math.max(c.open, c.close));
        assert.ok(c.low <= Math.min(c.open, c.close));
      }
    });

    it("drops malformed rows instead of emitting NaN candles", () => {
      const bad = [
        [1717200000000, "not-a-number", "1", "1", "1", "1", 0],
        [1717286400000, "1.0", "2.0", "0.5", "1.5", "10", 0],
      ] as never;
      const { candles } = parseBinanceKlines(bad);
      assert.equal(candles.length, 1, "the unparseable row should be dropped");
      assert.equal(candles[0].close, 1.5);
    });
  });

  describe("CoinGecko", () => {
    it("parses OHLC and reports no volume rather than inventing it", () => {
      const rows = [
        [1717200000000, 67000, 68500, 66800, 68210],
        [1717286400000, 68210, 69100, 67900, 68950],
      ] as never;
      const series = parseCoingeckoOhlc(rows);
      assert.equal(series.candles.length, 2);
      assert.equal(series.candles[0].time, 1717200000);
      assert.equal(
        series.volumes.length,
        0,
        "this endpoint has no volume; a fabricated one would be worse than none",
      );
    });

    it("maps simple/price into quotes, skipping absent coins", () => {
      const quotes = parseCoingeckoPrices({
        bitcoin: { usd: 68420, usd_24h_change: 1.86 },
        ethereum: { usd: 3550.5, usd_24h_change: -0.42 },
        // solana deliberately missing
      });
      assert.equal(quotes.length, 2);
      assert.equal(quotes[0].symbol, "BTC");
      assert.equal(quotes[0].last, 68420);
      assert.equal(quotes[1].changePct, -0.42);
    });

    it("defaults a missing change figure to zero rather than NaN", () => {
      const [quote] = parseCoingeckoPrices({ bitcoin: { usd: 68420 } });
      assert.equal(quote.changePct, 0);
    });
  });

  describe("Binance tickers", () => {
    it("matches symbols back to display names", () => {
      const quotes = parseBinanceTickers([
        { symbol: "ETHUSDT", lastPrice: "3550.50", priceChangePercent: "-0.42" },
        { symbol: "BTCUSDT", lastPrice: "68420.00", priceChangePercent: "1.86" },
        { symbol: "DOGEUSDT", lastPrice: "0.15", priceChangePercent: "5.0" },
      ]);
      // Order follows the market table, not the response.
      assert.deepEqual(
        quotes.map((q) => q.symbol),
        ["BTC", "ETH"],
        "unknown symbols should be ignored, known ones ordered consistently",
      );
      assert.equal(quotes[0].last, 68420);
    });
  });

  describe("Frankfurter FX", () => {
    const fixture = {
      base: "EUR",
      rates: {
        "2026-06-03": { USD: 1.0855 },
        "2026-06-01": { USD: 1.0812 },
        "2026-06-02": { USD: 1.0834 },
      },
    };

    it("sorts the unordered date map ascending", () => {
      const points = parseFrankfurterSeries(fixture, "USD");
      assert.equal(points.length, 3);
      assert.deepEqual(
        points.map((p) => p.value),
        [1.0812, 1.0834, 1.0855],
        "charts need ascending time; the API returns an object with no order",
      );
    });

    it("derives a change figure from the last two closes", () => {
      const quote = toFxQuote("EUR/USD", parseFrankfurterSeries(fixture, "USD"));
      assert.ok(quote);
      assert.equal(quote.last, 1.0855);
      assert.ok(Math.abs(quote.changePct - ((1.0855 - 1.0834) / 1.0834) * 100) < 1e-9);
    });

    it("returns nothing when there aren't two points to compare", () => {
      assert.equal(toFxQuote("EUR/USD", [{ time: 1, value: 1.08 }]), null);
    });

    it("skips days where the quote currency is absent", () => {
      const points = parseFrankfurterSeries(
        { base: "EUR", rates: { "2026-06-01": { GBP: 0.85 }, "2026-06-02": { USD: 1.08 } } },
        "USD",
      );
      assert.equal(points.length, 1);
    });
  });

  describe("news", () => {
    it("parses GDELT's non-standard timestamp format", () => {
      assert.equal(parseGdeltDate("20260601T120000Z"), Date.UTC(2026, 5, 1, 12, 0, 0));
      // Date.parse can't read that format, so a bad stamp must not become NaN.
      assert.ok(Number.isFinite(parseGdeltDate("garbage")));
    });

    it("deduplicates syndicated copies of the same story", () => {
      const items = parseGdelt({
        articles: [
          { url: "https://a.com/1", title: "Fed holds rates steady", seendate: "20260601T120000Z", domain: "a.com" },
          { url: "https://b.com/2", title: "Fed holds rates steady!", seendate: "20260601T110000Z", domain: "b.com" },
          { url: "https://c.com/3", title: "Bitcoin ETF inflows hit a high", seendate: "20260601T100000Z", domain: "c.com" },
        ],
      });
      assert.equal(items.length, 2, "near-identical syndicated titles should collapse");
    });

    it("returns newest first", () => {
      const items = parseGdelt({
        articles: [
          { url: "https://a.com/1", title: "Older story about inflation", seendate: "20260601T100000Z", domain: "a.com" },
          { url: "https://b.com/2", title: "Newer story about earnings", seendate: "20260601T180000Z", domain: "b.com" },
        ],
      });
      assert.match(items[0].title, /Newer/);
    });

    it("drops entries missing a title or url", () => {
      const items = parseGdelt({
        articles: [
          { url: "", title: "No url", seendate: "20260601T100000Z", domain: "a.com" },
          { url: "https://b.com/2", title: "", seendate: "20260601T100000Z", domain: "b.com" },
        ],
      });
      assert.equal(items.length, 0);
    });

    it("parses Marketaux and sorts newest first", () => {
      const items = parseMarketaux({
        data: [
          { uuid: "1", title: "CPI comes in hot", url: "https://x/1", source: "x", published_at: "2026-06-01T10:00:00Z" },
          { uuid: "2", title: "Fed signals cuts", url: "https://x/2", source: "x", published_at: "2026-06-01T18:00:00Z" },
        ],
      });
      assert.equal(items[0].title, "Fed signals cuts");
      assert.equal(items.length, 2);
    });

    describe("lesson matching", () => {
      const cases: [string, string | undefined][] = [
        ["Fed holds rates steady but signals two cuts", "interest-rates"],
        ["US CPI comes in above expectations", "economic-calendar"],
        ["Chipmaker beats on earnings, guides lower", "earnings-season"],
        ["Bitcoin ETF inflows hit three-month high", "crypto-structure"],
        ["Analyst raises price target on retailer", "headline-literacy"],
        ["Local council approves new bus lane", undefined],
      ];

      for (const [title, slug] of cases) {
        it(slug ? `links "${title.slice(0, 34)}…" to ${slug}` : "leaves unrelated headlines unlinked", () => {
          assert.equal(matchLesson(title)?.slug, slug);
        });
      }
    });
  });
});

describe("Twelve Data (stocks, server-side)", () => {
  it("reverses newest-first rows and converts strings", () => {
    const series = parseTwelveDataSeries({
      status: "ok",
      values: [
        { datetime: "2026-06-03", open: "191.0", high: "193.5", low: "190.2", close: "192.8", volume: "51000000" },
        { datetime: "2026-06-02", open: "188.0", high: "191.4", low: "187.5", close: "190.9", volume: "48000000" },
      ],
    });
    assert.equal(series.candles.length, 2);
    assert.ok(
      series.candles[0].time < series.candles[1].time,
      "the API returns newest-first; charts need oldest-first",
    );
    assert.equal(series.candles[0].close, 190.9);
    assert.equal(series.volumes[0].value, 48000000);
  });

  it("throws on the provider's HTTP-200 error envelope", () => {
    // Twelve Data reports failures with status 200 and status:"error", so a
    // naive parse would silently produce an empty chart.
    assert.throws(
      () => parseTwelveDataSeries({ status: "error", message: "You have run out of API credits" }),
      /run out of API credits/,
    );
  });

  it("hides the volume pane when the plan returns no volume", () => {
    const series = parseTwelveDataSeries({
      status: "ok",
      values: [{ datetime: "2026-06-03", open: "1", high: "2", low: "0.5", close: "1.5" }],
    });
    assert.equal(series.volumes.length, 0, "all-zero volume would be a lie, not data");
  });

  it("parses a quote and names known symbols", () => {
    const quote = parseTwelveDataQuote({ symbol: "SPY", close: "584.21", percent_change: "0.42" });
    assert.equal(quote.name, "S&P 500 ETF");
    assert.equal(quote.last, 584.21);
    assert.equal(quote.changePct, 0.42);
  });

  it("throws rather than reporting a NaN price", () => {
    assert.throws(() => parseTwelveDataQuote({ symbol: "SPY", close: "n/a" }), /no price/);
  });
});
