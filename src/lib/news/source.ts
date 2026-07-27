import { NEWS, type NewsStory } from "@/content/news";

/**
 * News integration point.
 *
 * The MVP serves a seeded sample feed so the section is fully functional with
 * no API key. To go live, implement this interface against a provider
 * (Marketaux, Benzinga, Alpha Vantage, an RSS aggregator — the shape is the
 * same) and swap the export at the bottom. Nothing in the UI needs to change.
 *
 * The one field a raw feed won't give you is `whyItMoves` — the plain-English
 * mechanism that makes this section educational rather than a headline dump.
 * That is deliberate: it should be written by an editor, or generated and then
 * reviewed, not passed through unchecked. A news aggregator without it is just
 * a news aggregator.
 */
export interface NewsSource {
  /** Newest first. `limit` is a hint, not a guarantee. */
  list(options?: { limit?: number }): Promise<NewsStory[]>;
  readonly isLive: boolean;
  readonly label: string;
}

const sampleSource: NewsSource = {
  isLive: false,
  label: "Sample feed",
  async list({ limit } = {}) {
    const sorted = [...NEWS].sort((a, b) => a.hoursAgo - b.hoursAgo);
    return limit ? sorted.slice(0, limit) : sorted;
  },
};

/*
 * Example live implementation:
 *
 * const liveSource: NewsSource = {
 *   isLive: true,
 *   label: "Marketaux",
 *   async list({ limit = 40 } = {}) {
 *     const res = await fetch(
 *       `https://api.marketaux.com/v1/news/all?filter_entities=true&limit=${limit}` +
 *         `&api_token=${process.env.NEWS_API_KEY}`,
 *       { next: { revalidate: 900 } },
 *     );
 *     const json = await res.json();
 *     return json.data.map(mapToStory);
 *   },
 * };
 */

export const newsSource: NewsSource = sampleSource;

export async function getNews(limit?: number): Promise<NewsStory[]> {
  return newsSource.list({ limit });
}
