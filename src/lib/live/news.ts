import { fetchJson, firstWorking, publicKey, type LiveResult } from "./http";

/**
 * Live market headlines.
 *
 * Deliberate limitation: a live wire gets you *headlines*, not the "why this
 * moves markets" explainer that makes the curated feed educational. Generating
 * that automatically would mean inventing analysis and presenting it as
 * editorial, which is exactly the thing this site teaches students to distrust.
 *
 * So live items carry what can be stated truthfully — headline, source, time —
 * plus a link to the lesson covering the mechanism the headline touches. That
 * link is keyword-derived navigation, not a claim about why price moved.
 *
 * Default provider is keyless. A key can be supplied at build time via
 * NEXT_PUBLIC_MARKETAUX_KEY, but read src/lib/live/README.md first: in a static
 * build that key is readable by anyone who opens devtools.
 */

export interface LiveHeadline {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: number;
  /** Related lesson, matched on keywords. Navigation, never an explanation. */
  lesson?: { slug: string; track: string; title: string };
}

/* ----------------------------------------------------- lesson matching --- */

const LESSON_KEYWORDS: {
  match: RegExp;
  lesson: { slug: string; track: string; title: string };
}[] = [
  {
    match: /\b(fed|fomc|federal reserve|interest rate|rate cut|rate hike|central bank|ecb|bank of england|boe)\b/i,
    lesson: { slug: "interest-rates", track: "macro", title: "How interest rates move everything" },
  },
  {
    match: /\b(inflation|cpi|consumer price|payroll|jobs report|unemployment|nfp)\b/i,
    lesson: { slug: "economic-calendar", track: "macro", title: "Reading an economic calendar" },
  },
  {
    match: /\b(earnings|quarterly results|guidance|profit warning|revenue beat|eps)\b/i,
    lesson: {
      slug: "earnings-season",
      track: "macro",
      title: "Earnings: why good numbers can send a stock down",
    },
  },
  {
    match: /\b(bitcoin|crypto|ethereum|stablecoin|token|blockchain|binance|coinbase)\b/i,
    lesson: {
      slug: "crypto-structure",
      track: "foundations",
      title: "Crypto: what's structurally different",
    },
  },
  {
    match: /\b(volatility|selloff|sell-off|plunge|surge|rally|crash|correction)\b/i,
    lesson: {
      slug: "trading-psychology",
      track: "risk",
      title: "Trading psychology: the three failures",
    },
  },
  {
    match: /\b(forecast|prediction|price target|analyst|upgrade|downgrade)\b/i,
    lesson: {
      slug: "headline-literacy",
      track: "macro",
      title: "Reading a headline for relevance versus noise",
    },
  },
];

export function matchLesson(title: string): LiveHeadline["lesson"] {
  return LESSON_KEYWORDS.find((k) => k.match.test(title))?.lesson;
}

/* ---------------------------------------------------------------- gdelt --- */

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language?: string;
}

/** GDELT stamps times as `20240601T120000Z`, which Date.parse won't take. */
export function parseGdeltDate(stamp: string): number {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(stamp);
  if (!m) return Date.now();
  const [, y, mo, d, h, mi, s] = m;
  return Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
}

export function parseGdelt(json: { articles?: GdeltArticle[] }): LiveHeadline[] {
  const seen = new Set<string>();
  const out: LiveHeadline[] = [];

  for (const a of json.articles ?? []) {
    if (!a.title || !a.url) continue;
    // Aggregators syndicate the same story across dozens of domains.
    const key = a.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 90);
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      id: a.url,
      title: a.title.trim(),
      url: a.url,
      source: a.domain ?? "unknown",
      publishedAt: parseGdeltDate(a.seendate),
      lesson: matchLesson(a.title),
    });
  }

  return out.sort((a, b) => b.publishedAt - a.publishedAt);
}

const GDELT_QUERY =
  '(inflation OR "interest rates" OR "federal reserve" OR "stock market" OR earnings OR bitcoin) sourcelang:english';

async function loadGdelt(limit: number): Promise<LiveHeadline[]> {
  const url =
    "https://api.gdeltproject.org/api/v2/doc/doc?query=" +
    encodeURIComponent(GDELT_QUERY) +
    `&mode=artlist&maxrecords=${limit}&format=json&sort=datedesc`;
  const json = await fetchJson<{ articles?: GdeltArticle[] }>(url, "GDELT");
  const items = parseGdelt(json);
  if (!items.length) throw new Error("GDELT returned no articles");
  return items;
}

/* ------------------------------------------------------------ marketaux --- */

interface MarketauxArticle {
  uuid: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
}

export function parseMarketaux(json: { data?: MarketauxArticle[] }): LiveHeadline[] {
  return (json.data ?? [])
    .filter((a) => a.title && a.url)
    .map((a) => ({
      id: a.uuid ?? a.url,
      title: a.title.trim(),
      url: a.url,
      source: a.source ?? "unknown",
      publishedAt: Date.parse(a.published_at) || Date.now(),
      lesson: matchLesson(a.title),
    }))
    .sort((a, b) => b.publishedAt - a.publishedAt);
}

async function loadMarketaux(limit: number, key: string): Promise<LiveHeadline[]> {
  const url =
    `https://api.marketaux.com/v1/news/all?language=en&filter_entities=true` +
    `&limit=${limit}&api_token=${key}`;
  const json = await fetchJson<{ data?: MarketauxArticle[] }>(url, "Marketaux");
  const items = parseMarketaux(json);
  if (!items.length) throw new Error("Marketaux returned no articles");
  return items;
}

/* --------------------------------------------------------------- public --- */

/**
 * Same-origin proxy, present only when the site runs on a Node host.
 *
 * Preferred when available: fetching server-side sidesteps CORS, isn't subject
 * to the visitor's regional blocks, and can use a private key. A 404 or 501
 * just means this is the static build, so the next provider takes over.
 */
async function loadProxy(limit: number): Promise<LiveHeadline[]> {
  const json = await fetchJson<{ items?: LiveHeadline[] }>(
    `/api/market/news?limit=${limit}`,
    "MarketLab server",
  );
  if (!json.items?.length) throw new Error("server proxy returned no headlines");
  // Lesson links are recomputed client-side so the mapping stays in one place.
  return json.items.map((item) => ({ ...item, lesson: matchLesson(item.title) }));
}

export async function getLiveHeadlines(limit = 24): Promise<LiveResult<LiveHeadline[]>> {
  const key = publicKey("MARKETAUX_KEY");

  return firstWorking<LiveHeadline[]>([
    { name: "MarketLab server", load: () => loadProxy(limit) },
    // A build-time key is a fallback, not the default — in a static build it
    // would be readable by anyone. See ./README.md.
    ...(key ? [{ name: "Marketaux", load: () => loadMarketaux(limit, key) }] : []),
    { name: "GDELT", load: () => loadGdelt(limit) },
  ]);
}
