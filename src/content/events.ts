import type { AssetClass } from "./news";

export type EventKind = "central-bank" | "inflation" | "jobs" | "growth" | "earnings" | "crypto";

export interface MarketEvent {
  id: string;
  /** Full name, e.g. "US Consumer Price Index (CPI)". */
  title: string;
  /** Ticker-style abbreviation for dense rows. */
  short: string;
  region: string;
  kind: EventKind;
  impact: "high" | "medium" | "low";
  assets: AssetClass[];
  /** ISO timestamp of the release. */
  at: string;
  previous?: string;
  consensus?: string;
  /** Why traders care — the mechanism, not a prediction. */
  whyWatched: string;
  /** Concrete things to observe. Never "what to buy". */
  watchFor: string[];
  /**
   * True when the timing follows a genuinely stable published convention
   * (e.g. US payrolls on the first Friday). False means the date is a
   * plausible placeholder that a live calendar feed would replace.
   */
  ruleBased: boolean;
  lesson?: { slug: string; track: string; title: string };
}

/* --------------------------------------------------------------- schedule */

type Schedule =
  | { type: "nth-weekday"; nth: number; weekday: number; hourUTC: number; minuteUTC: number }
  | { type: "day-of-month"; day: number; hourUTC: number; minuteUTC: number }
  | { type: "interval-weeks"; weeks: number; anchor: string; hourUTC: number; minuteUTC: number };

/** Date of the nth (1-based, or -1 for last) `weekday` in a given month. */
function nthWeekdayOf(year: number, month: number, nth: number, weekday: number): Date {
  if (nth > 0) {
    const first = new Date(Date.UTC(year, month, 1));
    const shift = (weekday - first.getUTCDay() + 7) % 7;
    return new Date(Date.UTC(year, month, 1 + shift + (nth - 1) * 7));
  }
  const last = new Date(Date.UTC(year, month + 1, 0));
  const shift = (last.getUTCDay() - weekday + 7) % 7;
  return new Date(Date.UTC(year, month + 1, 0 - shift));
}

/** Occurrences of a schedule between `from` and `from + days`. */
function occurrences(schedule: Schedule, from: Date, days: number): Date[] {
  const until = new Date(from.getTime() + days * 86400000);
  const out: Date[] = [];

  if (schedule.type === "interval-weeks") {
    const step = schedule.weeks * 7 * 86400000;
    let t = new Date(schedule.anchor).getTime();
    // Walk forward from the anchor in fixed strides until we reach the window.
    while (t < from.getTime()) t += step;
    for (; t <= until.getTime(); t += step) {
      const d = new Date(t);
      d.setUTCHours(schedule.hourUTC, schedule.minuteUTC, 0, 0);
      if (d >= from && d <= until) out.push(d);
    }
    return out;
  }

  for (let m = 0; m <= Math.ceil(days / 28) + 1; m++) {
    const base = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + m, 1),
    );
    const d =
      schedule.type === "nth-weekday"
        ? nthWeekdayOf(base.getUTCFullYear(), base.getUTCMonth(), schedule.nth, schedule.weekday)
        : new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), schedule.day));
    d.setUTCHours(schedule.hourUTC, schedule.minuteUTC, 0, 0);
    if (d >= from && d <= until) out.push(d);
  }
  return out;
}

/* -------------------------------------------------------------- templates */

interface Template extends Omit<MarketEvent, "id" | "at"> {
  schedule: Schedule;
}

const TEMPLATES: Template[] = [
  {
    title: "US Non-Farm Payrolls",
    short: "NFP",
    region: "US",
    kind: "jobs",
    impact: "high",
    assets: ["Forex", "Futures", "Bonds", "Stocks"],
    // Payrolls are published on the first Friday of the month — a stable,
    // decades-old convention rather than a guess.
    schedule: { type: "nth-weekday", nth: 1, weekday: 5, hourUTC: 13, minuteUTC: 30 },
    ruleBased: true,
    previous: "+180k",
    consensus: "+165k",
    whyWatched:
      "Employment strength feeds wage growth, wage growth feeds inflation, and inflation drives the central bank's rate decision. It is the most reliably volatile scheduled release in index futures and forex.",
    watchFor: [
      "The headline number against consensus — only the surprise is new information.",
      "Revisions to the previous two months. A strong print alongside a large downward revision is often net negative.",
      "Average hourly earnings, which matter more for inflation than the job count does.",
      "The shape of the reaction: a violent first move that partly retraces is normal, and is mostly automated execution rather than considered repricing.",
    ],
    lesson: { slug: "economic-calendar", track: "macro", title: "Reading an economic calendar" },
  },
  {
    title: "US Consumer Price Index",
    short: "CPI",
    region: "US",
    kind: "inflation",
    impact: "high",
    assets: ["Stocks", "Bonds", "Forex", "Futures"],
    schedule: { type: "day-of-month", day: 12, hourUTC: 13, minuteUTC: 30 },
    ruleBased: false,
    previous: "3.1% y/y",
    consensus: "3.0% y/y",
    whyWatched:
      "Inflation is the main input to the rate decision, so CPI usually moves more assets than any other single number. Note that markets react to the gap against consensus, not to whether inflation is high or low in absolute terms.",
    watchFor: [
      "Core CPI (excluding food and energy) — often more informative than the headline.",
      "The month-on-month figure, which shows the current run rate rather than the last twelve months.",
      "Bond yields first: the rate view is expressed most directly there, and equities usually follow.",
    ],
    lesson: { slug: "interest-rates", track: "macro", title: "How interest rates move everything" },
  },
  {
    title: "FOMC rate decision & projections",
    short: "FOMC",
    region: "US",
    kind: "central-bank",
    impact: "high",
    assets: ["Stocks", "Bonds", "Forex", "Futures", "Crypto"],
    schedule: { type: "interval-weeks", weeks: 7, anchor: "2026-01-28", hourUTC: 19, minuteUTC: 0 },
    ruleBased: false,
    whyWatched:
      "The decision itself is normally priced in well beforehand. What moves markets is the projection material and the press conference half an hour later — that is where the surprise lives.",
    watchFor: [
      "The projections ('dot plot') against what rate futures already implied.",
      "Any change in the statement's language, which traders read word by word.",
      "The press conference, where the initial reaction is frequently reversed.",
      "Whether the vote was unanimous — a split committee previews the next meeting.",
    ],
    lesson: { slug: "interest-rates", track: "macro", title: "How interest rates move everything" },
  },
  {
    title: "Bank of England rate decision",
    short: "BoE",
    region: "UK",
    kind: "central-bank",
    impact: "high",
    assets: ["Forex", "Stocks", "Bonds"],
    schedule: { type: "interval-weeks", weeks: 6, anchor: "2026-02-05", hourUTC: 12, minuteUTC: 0 },
    ruleBased: false,
    whyWatched:
      "Sets the rate for sterling. Because UK decisions are often well anticipated, the market usually trades the vote split and the minutes rather than the rate itself.",
    watchFor: [
      "The vote split — a 5-4 hold signals a cut is close.",
      "Sterling against the euro, which isolates the UK-specific reaction.",
      "Gilt yields, which reprice the whole expected path immediately.",
    ],
  },
  {
    title: "ECB rate decision",
    short: "ECB",
    region: "EU",
    kind: "central-bank",
    impact: "high",
    assets: ["Forex", "Stocks", "Bonds"],
    schedule: { type: "interval-weeks", weeks: 6, anchor: "2026-01-29", hourUTC: 13, minuteUTC: 15 },
    ruleBased: false,
    whyWatched:
      "Currency pairs are relative bets, so what matters is the difference between the ECB's expected path and the Fed's. A dovish ECB alongside a patient Fed pushes EUR/USD down even if neither actually moves rates.",
    watchFor: [
      "The gap between the ECB's guidance and the Fed's, not either in isolation.",
      "The press conference at 13:45 UTC, which routinely moves more than the decision.",
    ],
    lesson: {
      slug: "futures-and-forex",
      track: "foundations",
      title: "Futures and forex: contracts, margin, leverage",
    },
  },
  {
    title: "UK inflation (CPI)",
    short: "UK CPI",
    region: "UK",
    kind: "inflation",
    impact: "medium",
    assets: ["Forex", "Bonds", "Stocks"],
    schedule: { type: "day-of-month", day: 17, hourUTC: 7, minuteUTC: 0 },
    ruleBased: false,
    previous: "2.8% y/y",
    consensus: "2.6% y/y",
    whyWatched:
      "Drives Bank of England expectations, and therefore sterling and gilts. Services inflation within the release is watched more closely than the headline, because it is the stickiest component.",
    watchFor: [
      "Services inflation specifically — the number the MPC talks about most.",
      "Sterling's reaction in the first minutes, when spreads are widest.",
    ],
  },
  {
    title: "US ISM Manufacturing PMI",
    short: "ISM",
    region: "US",
    kind: "growth",
    impact: "medium",
    assets: ["Stocks", "Futures", "Bonds"],
    schedule: { type: "day-of-month", day: 1, hourUTC: 15, minuteUTC: 0 },
    ruleBased: false,
    previous: "49.2",
    consensus: "50.1",
    whyWatched:
      "A survey of purchasing managers, so it leads official data rather than confirming it. Above 50 means expansion, below means contraction — and the 50 line itself is a psychological level markets react to.",
    watchFor: [
      "Whether it crosses 50 in either direction.",
      "The new orders and prices-paid sub-indices, which lead the headline.",
    ],
  },
  {
    title: "US quarterly GDP (advance estimate)",
    short: "GDP",
    region: "US",
    kind: "growth",
    impact: "medium",
    assets: ["Stocks", "Bonds", "Forex"],
    schedule: { type: "interval-weeks", weeks: 13, anchor: "2026-01-29", hourUTC: 13, minuteUTC: 30 },
    ruleBased: false,
    whyWatched:
      "The broadest measure of economic output, but backward-looking — it describes a quarter that ended weeks ago. Markets usually treat it as confirmation rather than news, unless it diverges sharply from expectations.",
    watchFor: [
      "The gap against consensus rather than the level.",
      "Whether the reaction fits the current regime: early in a slowdown, weak growth can be read as bullish because it brings cuts closer.",
    ],
  },
  {
    title: "Large-cap technology earnings (sample)",
    short: "Earnings",
    region: "US",
    kind: "earnings",
    impact: "high",
    assets: ["Stocks"],
    schedule: { type: "interval-weeks", weeks: 13, anchor: "2026-02-04", hourUTC: 21, minuteUTC: 0 },
    ruleBased: false,
    whyWatched:
      "Individual shares produce their largest single-day moves of the year on earnings. Reports land outside market hours, so the result is a gap — and no stop-loss can protect you across a price range where no trading occurred.",
    watchFor: [
      "Guidance for coming quarters, which usually matters more than the quarter just reported.",
      "How far the stock ran into the report — the bar is whatever is already priced in, not the consensus number.",
      "The options-implied move: a 3% reaction against a ±8% implied move is a small reaction, not a big one.",
    ],
    lesson: {
      slug: "earnings-season",
      track: "macro",
      title: "Earnings: why good numbers can send a stock down",
    },
  },
  {
    title: "Monthly crypto options expiry",
    short: "Expiry",
    region: "Global",
    kind: "crypto",
    impact: "medium",
    assets: ["Crypto"],
    // Monthly crypto derivatives expiry settles on the last Friday, 08:00 UTC.
    schedule: { type: "nth-weekday", nth: -1, weekday: 5, hourUTC: 8, minuteUTC: 0 },
    ruleBased: true,
    whyWatched:
      "Large notional value settles at once, and positioning around it can pin or distort price in the hours beforehand. It is mechanical flow rather than information — which is exactly why it is worth recognising.",
    watchFor: [
      "Unusual volume that carries no informational content — the index-rebalancing lesson in reverse.",
      "Funding rates on perpetuals in the days around it, as leveraged positioning unwinds.",
    ],
    lesson: {
      slug: "crypto-structure",
      track: "foundations",
      title: "Crypto: what's structurally different",
    },
  },
];

/**
 * Build the event board for the next `days` days, newest first.
 *
 * Dates are computed at call time from recurrence rules so the board is always
 * current. Rules marked `ruleBased` follow genuinely stable public conventions;
 * the rest are plausible placeholders a live calendar feed would replace.
 */
export function buildEvents(from: Date = new Date(), days = 45): MarketEvent[] {
  const out: MarketEvent[] = [];
  for (const t of TEMPLATES) {
    const { schedule, ...rest } = t;
    for (const at of occurrences(schedule, from, days)) {
      out.push({
        ...rest,
        id: `${t.short.toLowerCase().replace(/\s+/g, "-")}-${at.toISOString().slice(0, 10)}`,
        at: at.toISOString(),
      });
    }
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  "central-bank": "Central bank",
  inflation: "Inflation",
  jobs: "Jobs",
  growth: "Growth",
  earnings: "Earnings",
  crypto: "Crypto",
};
