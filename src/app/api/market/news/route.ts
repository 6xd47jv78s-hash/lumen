import { NextResponse } from "next/server";
import { parseGdelt, parseMarketaux } from "@/lib/live/news";

/**
 * Headline proxy.
 *
 * Worth having even though the browser can call GDELT directly: fetching
 * server-side sidesteps CORS entirely, isn't subject to the visitor's regional
 * blocks, and lets a Marketaux key stay private instead of being compiled into
 * the bundle. The client tries this route first and falls back to calling the
 * keyless provider itself, so the same code works on both hosts.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

const GDELT_QUERY =
  '(inflation OR "interest rates" OR "federal reserve" OR "stock market" OR earnings OR bitcoin) sourcelang:english';

export async function GET(request: Request) {
  const limit = Math.min(
    50,
    Math.max(1, Number(new URL(request.url).searchParams.get("limit")) || 24),
  );
  const key = process.env.MARKETAUX_KEY;

  try {
    if (key) {
      const res = await fetch(
        `https://api.marketaux.com/v1/news/all?language=en&filter_entities=true&limit=${limit}&api_token=${key}`,
        { signal: AbortSignal.timeout(9000), next: { revalidate: 300 } },
      );
      if (res.ok) {
        const items = parseMarketaux(await res.json());
        if (items.length) {
          return NextResponse.json(
            { items, provider: "Marketaux" },
            { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=900" } },
          );
        }
      }
      // Fall through to the keyless provider rather than failing outright.
    }

    const res = await fetch(
      "https://api.gdeltproject.org/api/v2/doc/doc?query=" +
        encodeURIComponent(GDELT_QUERY) +
        `&mode=artlist&maxrecords=${limit}&format=json&sort=datedesc`,
      { signal: AbortSignal.timeout(9000), next: { revalidate: 300 } },
    );
    if (!res.ok) {
      return NextResponse.json({ error: `GDELT returned HTTP ${res.status}` }, { status: 502 });
    }

    const items = parseGdelt(await res.json());
    if (!items.length) {
      return NextResponse.json({ error: "No headlines available" }, { status: 502 });
    }

    return NextResponse.json(
      { items, provider: "GDELT" },
      { headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=900" } },
    );
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
