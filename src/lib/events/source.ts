import { buildEvents, type MarketEvent } from "@/content/events";

/**
 * Economic-calendar integration point.
 *
 * The MVP generates the board from recurrence rules so it is always current
 * without an API key. To go live, implement this against a calendar provider
 * (Trading Economics, Financial Modeling Prep, FRED release dates, an ICS feed)
 * and swap the export.
 *
 * The fields a raw calendar feed will *not* give you are `whyWatched` and
 * `watchFor`. That is the whole difference between this board and a list of
 * dates, and it is deliberately editorial — it explains the mechanism and what
 * to observe, and it never says what to buy.
 */
export interface EventSource {
  list(options?: { days?: number }): Promise<MarketEvent[]>;
  readonly isLive: boolean;
  readonly label: string;
}

const generatedSource: EventSource = {
  isLive: false,
  label: "Generated schedule",
  async list({ days = 45 } = {}) {
    return buildEvents(new Date(), days);
  },
};

/*
 * Example live implementation:
 *
 * const liveSource: EventSource = {
 *   isLive: true,
 *   label: "Trading Economics",
 *   async list({ days = 45 } = {}) {
 *     const to = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
 *     const res = await fetch(
 *       `https://api.tradingeconomics.com/calendar/country/all/${today}/${to}` +
 *         `?c=${process.env.CALENDAR_API_KEY}&f=json`,
 *       { next: { revalidate: 1800 } },
 *     );
 *     return (await res.json()).map(mapToEvent);   // supply whyWatched/watchFor
 *   },
 * };
 */

export const eventSource: EventSource = generatedSource;

export async function getEvents(days?: number): Promise<MarketEvent[]> {
  return eventSource.list({ days });
}
