import { NextResponse } from "next/server";
import {
  STOCK_SYMBOLS,
  TWELVE_DATA_INTERVAL,
  isStockSymbol,
  parseTwelveDataSeries,
  type TwelveDataSeries,
} from "@/lib/live/stocks";

/**
 * Stock and index candles.
 *
 * Server-only, because it needs a paid-tier API key. On the static build this
 * route doesn't exist at all (see scripts/build-export.mjs) and the client
 * treats the resulting 404 as "stocks unavailable on this host" — which is the
 * honest answer, rather than shipping a key to the browser.
 *
 * Crypto and FX deliberately do NOT route through here: they're keyless, so
 * calling them straight from the browser is one less hop and works on both
 * hosts identically.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") ?? "").toUpperCase();
  const interval = searchParams.get("interval") ?? "1d";

  if (!isStockSymbol(symbol)) {
    return NextResponse.json(
      { error: `Unknown symbol. Supported: ${Object.keys(STOCK_SYMBOLS).join(", ")}` },
      { status: 400 },
    );
  }
  const providerInterval = TWELVE_DATA_INTERVAL[interval];
  if (!providerInterval) {
    return NextResponse.json({ error: `Unsupported interval "${interval}"` }, { status: 400 });
  }

  const key = process.env.TWELVE_DATA_KEY;
  if (!key) {
    // 501 rather than 500: nothing is broken, the capability just isn't
    // configured, and the UI renders a setup hint instead of an error.
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Live stock data needs a TWELVE_DATA_KEY environment variable on the server.",
      },
      { status: 501 },
    );
  }

  try {
    const url =
      `https://api.twelvedata.com/time_series?symbol=${symbol}` +
      `&interval=${providerInterval}&outputsize=200&apikey=${key}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(9000),
      // Short shared cache: the free tier is rate-limited per minute, and every
      // visitor asking for the same chart shouldn't each spend a call.
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Provider returned HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const series = parseTwelveDataSeries((await res.json()) as TwelveDataSeries);
    if (!series.candles.length) {
      return NextResponse.json({ error: "Provider returned no candles" }, { status: 502 });
    }

    return NextResponse.json(
      { series, provider: "Twelve Data", name: STOCK_SYMBOLS[symbol] },
      { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
