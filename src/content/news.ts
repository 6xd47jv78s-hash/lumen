export type NewsCategory =
  | "Central banks"
  | "Inflation & jobs"
  | "Geopolitics"
  | "Earnings"
  | "Crypto regulation";

export type AssetClass = "Stocks" | "Crypto" | "Forex" | "Futures" | "Bonds";

export interface NewsStory {
  id: string;
  headline: string;
  source: string;
  /** Hours before "now" — rendered as relative time so the sample feed always
   *  reads as current. Real stories from an API would carry a timestamp. */
  hoursAgo: number;
  category: NewsCategory;
  assets: AssetClass[];
  /** Two or three sentences of what happened. */
  summary: string;
  /** The whole point of this section: plain-English market mechanism. */
  whyItMoves: string;
  impact: "high" | "medium" | "low";
  /** Deep-link into the lesson that explains the underlying concept. */
  lesson?: { slug: string; track: string; title: string };
}

/**
 * Seeded sample feed.
 *
 * These are written for teaching: each pairs a realistic headline with the
 * mechanism connecting it to prices. They are clearly labelled as samples in
 * the UI — presenting invented stories as real reporting would be dishonest and
 * would also teach students to trust a feed without checking its source.
 *
 * Live integration: implement `NewsSource` in src/lib/news/source.ts against a
 * real provider and map its response onto `NewsStory`. Nothing else changes —
 * `whyItMoves` becomes the field an editor (or a model) fills in.
 */
export const NEWS: NewsStory[] = [
  {
    id: "fed-holds-signals-cuts",
    headline: "Fed holds rates steady but signals two cuts later this year",
    source: "Sample feed",
    hoursAgo: 3,
    category: "Central banks",
    assets: ["Stocks", "Bonds", "Forex", "Futures"],
    impact: "high",
    summary:
      "The Federal Open Market Committee left its policy rate unchanged, as expected. The updated projections showed a median of two cuts before year-end, one more than the previous round. Equity indices rallied into the close; the dollar weakened against most major currencies.",
    whyItMoves:
      "The decision itself was fully priced in, so it moved nothing — what moved markets was the projection. Interest rates are the discount rate applied to every future pound of company profit: lower expected rates make distant future earnings worth more today, which lifts equities, and growth companies most of all because more of their value sits far in the future. The dollar fell for a separate reason: lower US rates reduce the return on holding dollars relative to other currencies, so capital flows elsewhere.",
    lesson: {
      slug: "interest-rates",
      track: "macro",
      title: "How interest rates move everything",
    },
  },
  {
    id: "cpi-hotter",
    headline: "US inflation comes in at 3.4% against 3.1% expected",
    source: "Sample feed",
    hoursAgo: 9,
    category: "Inflation & jobs",
    assets: ["Stocks", "Bonds", "Forex"],
    impact: "high",
    summary:
      "Headline CPI rose 3.4% year-on-year, above the 3.1% consensus. Core inflation was also firmer than forecast. Index futures sold off sharply in the first minutes after the release before recovering roughly half the move within the hour.",
    whyItMoves:
      "Only the surprise matters. The 3.1% consensus was already reflected in prices; the extra 0.3 points was new information, and it implies the central bank has less room to cut. Higher-for-longer rates mean a higher discount rate on future earnings and better returns on cash, both of which are bad for equities. Note the shape of the reaction too — a violent first move followed by a partial recovery is characteristic of scheduled data releases, because the initial move is dominated by automated execution and stop orders rather than considered repricing.",
    lesson: {
      slug: "economic-calendar",
      track: "macro",
      title: "Reading an economic calendar",
    },
  },
  {
    id: "nfp-miss",
    headline: "US payrolls add 95,000 jobs, well short of the 180,000 forecast",
    source: "Sample feed",
    hoursAgo: 28,
    category: "Inflation & jobs",
    assets: ["Forex", "Futures", "Bonds"],
    impact: "high",
    summary:
      "Non-farm payrolls came in far below expectations, with downward revisions to the previous two months. The unemployment rate ticked up to 4.3%. Bond yields fell sharply; the dollar weakened.",
    whyItMoves:
      "A weak labour market means less wage pressure, which means less inflation, which means the central bank can cut sooner. Bond yields fell because bonds reprice immediately for a lower expected rate path. Equities face a genuine tension here: cuts are good for valuations, but a weakening jobs market is bad for company revenues. Which effect dominates depends on where the economy is in its cycle — early in a slowdown, markets usually celebrate the cuts; deep in one, they start pricing the recession instead.",
  },
  {
    id: "boe-split-vote",
    headline: "Bank of England holds, but the vote splits 5-4",
    source: "Sample feed",
    hoursAgo: 34,
    category: "Central banks",
    assets: ["Forex", "Stocks", "Bonds"],
    impact: "medium",
    summary:
      "The Monetary Policy Committee voted 5-4 to hold Bank Rate, the narrowest margin in over a year. Sterling rose against the euro on the announcement.",
    whyItMoves:
      "The rate didn't change, so the information was entirely in the vote split. A 5-4 vote signals that one more member shifting would produce a cut — traders read it as a preview of the next meeting and reprice the expected path accordingly. This is a good illustration of a general principle: once an outcome is expected, markets move on the *details around* the outcome, because that's where the surprise lives.",
  },
  {
    id: "chipmaker-beats-guides-down",
    headline: "Semiconductor maker beats on earnings, then falls 11%",
    source: "Sample feed",
    hoursAgo: 15,
    category: "Earnings",
    assets: ["Stocks"],
    impact: "medium",
    summary:
      "The company reported quarterly revenue and profit ahead of analyst estimates, but guided next-quarter revenue below consensus, citing slower data-centre orders. The stock fell 11% in after-hours trading and opened sharply lower.",
    whyItMoves:
      "A textbook case of why 'good numbers' can send a price down. You own a claim on *future* profits, so guidance about the next quarter matters more than the one just reported — which is already history and was largely anticipated. This is also an overnight gap: the stock closed at one price and opened materially lower, with no trading in between. A stop-loss placed inside that gap would have executed at the open, not at the stop price.",
    lesson: {
      slug: "earnings-season",
      track: "macro",
      title: "Earnings: what actually moves a stock",
    },
  },
  {
    id: "bank-earnings-strong",
    headline: "Major banks kick off earnings season with strong net interest income",
    source: "Sample feed",
    hoursAgo: 40,
    category: "Earnings",
    assets: ["Stocks"],
    impact: "medium",
    summary:
      "Three large US banks reported results ahead of expectations, driven by higher net interest income. Loan loss provisions rose modestly. The sector outperformed the broad index.",
    whyItMoves:
      "Banks earn the spread between what they pay depositors and what they charge borrowers, so a higher rate environment is generally good for them — the opposite of most other sectors. This is why 'rates up is bad for stocks' is too crude a rule: rate changes redistribute value between sectors as well as affecting the market overall. Banks are also watched as an early economic indicator, because rising loan loss provisions are a bank's own forecast of how many customers will default.",
  },
  {
    id: "strait-shipping",
    headline: "Shipping disruption in a major strait pushes crude up 6%",
    source: "Sample feed",
    hoursAgo: 20,
    category: "Geopolitics",
    assets: ["Futures", "Stocks", "Forex"],
    impact: "high",
    summary:
      "Vessel traffic through a key shipping route was suspended following regional security incidents. Brent crude rose 6%; airline stocks fell; energy producers rallied.",
    whyItMoves:
      "Oil is priced on the balance between supply and demand, and a disrupted shipping route is an immediate supply constraint. The knock-on effects follow the cost structure of each business: fuel is one of an airline's largest costs, so airline margins compress and their shares fall, while energy producers sell the same barrels at a higher price and gain. Sustained higher oil prices also feed into inflation data weeks later, which is why an event like this can eventually move rate expectations too.",
  },
  {
    id: "export-controls",
    headline: "New export controls announced on advanced chip equipment",
    source: "Sample feed",
    hoursAgo: 52,
    category: "Geopolitics",
    assets: ["Stocks", "Futures"],
    impact: "medium",
    summary:
      "Restrictions were extended to cover additional categories of semiconductor manufacturing equipment. Equipment makers fell between 3% and 7%; some domestic chip designers rose.",
    whyItMoves:
      "Trade restrictions redistribute value rather than simply destroying it. Companies that lose access to a market lose revenue directly. Companies shielded from foreign competition, or positioned to supply a domestic replacement, gain. The market's job in the hours after an announcement is working out which category each company falls into — which is why the initial reaction is often noisy and gets substantially revised over the following days.",
  },
  {
    id: "spot-etf-flows",
    headline: "Crypto ETF inflows hit a three-month high",
    source: "Sample feed",
    hoursAgo: 6,
    category: "Crypto regulation",
    assets: ["Crypto"],
    impact: "medium",
    summary:
      "Spot crypto exchange-traded funds recorded their largest weekly net inflow since April. Bitcoin rose 4% over the period; funding rates on perpetual futures turned notably positive.",
    whyItMoves:
      "ETF flows are one of the few clean measures of institutional demand in crypto, because the funds must buy the underlying asset to create new shares — the flow becomes real buying rather than sentiment. The funding rate detail is the more useful signal for a trader, though: persistently positive funding means leveraged traders are heavily positioned long and paying to hold it. Crowded positioning is fuel, and it tends to unwind quickly when price moves the other way.",
    lesson: {
      slug: "crypto-structure",
      track: "foundations",
      title: "Crypto: what's structurally different",
    },
  },
  {
    id: "stablecoin-rules",
    headline: "Regulators publish final stablecoin reserve requirements",
    source: "Sample feed",
    hoursAgo: 46,
    category: "Crypto regulation",
    assets: ["Crypto"],
    impact: "medium",
    summary:
      "Final rules require full backing in cash and short-dated government debt, with monthly attestation. Larger issuers rose on the news; smaller ones with less transparent reserves saw outflows.",
    whyItMoves:
      "Stablecoins are the unit most crypto pairs are actually quoted in, so their credibility underpins the plumbing of the whole market. Clear reserve rules reduce the risk of a de-pegging event — the scenario where a 'dollar' token stops being worth a dollar and cascades through everything priced in it. Note the split reaction: regulation that raises compliance costs tends to favour large incumbents who can absorb them, which is a pattern worth recognising across every regulated industry, not just crypto.",
  },
  {
    id: "exchange-outage",
    headline: "Major exchange halts withdrawals during volatility spike",
    source: "Sample feed",
    hoursAgo: 62,
    category: "Crypto regulation",
    assets: ["Crypto"],
    impact: "high",
    summary:
      "A large centralised exchange suspended withdrawals for several hours during a sharp sell-off, citing infrastructure load. Prices on that venue diverged from other exchanges before converging again after service resumed.",
    whyItMoves:
      "This is counterparty risk made visible. Assets on an exchange are a claim against that exchange, not coins you control — when withdrawals stop, that claim becomes temporarily unenforceable, and the market prices that uncertainty by discounting the venue's own quotes. The price divergence between exchanges during the halt is the mechanism in plain sight: identical assets traded at different prices because you couldn't move them between venues to arbitrage the gap.",
    lesson: {
      slug: "crypto-structure",
      track: "foundations",
      title: "Crypto: what's structurally different",
    },
  },
  {
    id: "yield-curve",
    headline: "Ten-year yield jumps 18 basis points after weak bond auction",
    source: "Sample feed",
    hoursAgo: 26,
    category: "Central banks",
    assets: ["Bonds", "Stocks", "Forex"],
    impact: "medium",
    summary:
      "A government bond auction saw weaker-than-usual demand, pushing the 10-year yield sharply higher. Rate-sensitive equity sectors underperformed; the currency strengthened.",
    whyItMoves:
      "A weak auction means buyers demanded a higher yield to lend, which pushes yields up across the curve. That matters far beyond bond markets: the 10-year yield is the reference rate for mortgages, corporate borrowing and equity valuation models. Higher long-term yields also make safe government debt more competitive with shares — if you can earn a solid guaranteed return, the case for owning volatile equities weakens. Watching the 10-year often explains an equity move better than equity commentary does.",
  },
  {
    id: "eurusd-divergence",
    headline: "Euro slides as ECB signals earlier cuts than the Fed",
    source: "Sample feed",
    hoursAgo: 13,
    category: "Central banks",
    assets: ["Forex"],
    impact: "medium",
    summary:
      "EUR/USD fell around 0.9% after ECB commentary pointed to cuts beginning ahead of the Federal Reserve. Rate futures repriced the expected divergence between the two paths.",
    whyItMoves:
      "Currency pairs are relative bets, so what matters is the *difference* between two countries' expected rates, not either one alone. If euro rates are expected to fall while dollar rates hold, holding euros pays relatively less — capital moves toward the dollar and the pair falls. This interest-rate differential is also what determines the carry you pay or receive for holding a forex position overnight.",
    lesson: {
      slug: "futures-and-forex",
      track: "foundations",
      title: "Futures and forex: contracts, margin, leverage",
    },
  },
  {
    id: "retail-guidance",
    headline: "Retailer cuts full-year outlook, citing weaker discretionary spending",
    source: "Sample feed",
    hoursAgo: 55,
    category: "Earnings",
    assets: ["Stocks"],
    impact: "low",
    summary:
      "A large general retailer lowered its annual profit guidance. The shares fell 8%; the wider retail sector fell in sympathy despite no company-specific news elsewhere.",
    whyItMoves:
      "The sympathy move is the interesting part. One company's guidance is treated as evidence about conditions facing every similar company, so the whole sector reprices before those companies have said anything. For a trader this is a live demonstration of correlation risk: holding five retailers is not five independent positions — it is one bet on consumer spending, sized five times.",
    lesson: {
      slug: "trading-plan",
      track: "strategy",
      title: "The trading plan",
    },
  },
  {
    id: "index-rebalance",
    headline: "Index rebalancing drives unusual volume in the closing auction",
    source: "Sample feed",
    hoursAgo: 70,
    category: "Geopolitics",
    assets: ["Stocks", "Futures"],
    impact: "low",
    summary:
      "Quarterly index rebalancing produced volume several times the daily average in affected names, concentrated in the closing auction. Most of the price impact reversed the following session.",
    whyItMoves:
      "This is mechanical flow, not information. Index funds must hold the index's constituents in the index's weights, so when the index changes they are forced to buy and sell regardless of price or value. It's worth recognising because it's a case where a huge volume spike carries almost no signal — a useful reminder that volume needs context, and that some of the biggest bars on a chart mean nothing at all about what an asset is worth.",
    lesson: {
      slug: "volume",
      track: "chart-reading",
      title: "Volume: reading participation alongside price",
    },
  },
  {
    id: "wage-growth",
    headline: "UK wage growth cools to 4.1%, slowest in two years",
    source: "Sample feed",
    hoursAgo: 78,
    category: "Inflation & jobs",
    assets: ["Forex", "Stocks", "Bonds"],
    impact: "medium",
    summary:
      "Average weekly earnings growth slowed more than expected. Sterling eased; gilt yields fell as markets brought forward expectations for the first cut.",
    whyItMoves:
      "Wages are watched closely because they're the most persistent driver of inflation — goods prices can spike and fall back, but pay rises tend to stick. Cooling wage growth therefore gives a central bank confidence that inflation will keep falling, which brings rate cuts closer. The currency weakened for the same reason the bond market rallied: both are pricing a lower expected path for rates.",
  },
];

export const NEWS_CATEGORIES: NewsCategory[] = [
  "Central banks",
  "Inflation & jobs",
  "Geopolitics",
  "Earnings",
  "Crypto regulation",
];

export const ASSET_CLASSES: AssetClass[] = ["Stocks", "Crypto", "Forex", "Futures", "Bonds"];
