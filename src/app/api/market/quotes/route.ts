import { NextResponse } from "next/server";
import { STOCK_SYMBOLS, parseTwelveDataQuote, type TwelveDataQuote } from "@/lib/live/stocks";

/** Index and stock quotes for the snapshot bar. Server-only; needs a key. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const key = process.env.TWELVE_DATA_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "not_configured", message: "Live stock quotes need TWELVE_DATA_KEY." },
      { status: 501 },
    );
  }

  const symbols = Object.keys(STOCK_SYMBOLS).slice(0, 3);

  try {
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const res = await fetch(
          `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${key}`,
          { signal: AbortSignal.timeout(9000), next: { revalidate: 60 } },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return parseTwelveDataQuote((await res.json()) as TwelveDataQuote);
      }),
    );

    // One bad symbol shouldn't empty the whole bar.
    const quotes = results
      .filter((r): r is PromiseFulfilledResult<ReturnType<typeof parseTwelveDataQuote>> =>
        r.status === "fulfilled",
      )
      .map((r) => r.value);

    if (!quotes.length) {
      return NextResponse.json({ error: "No quotes available" }, { status: 502 });
    }

    return NextResponse.json(
      { quotes, provider: "Twelve Data" },
      { headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
