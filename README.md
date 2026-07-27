# MarketLab

An interactive education platform that teaches 14–18 year olds how to read and
understand financial markets — stocks, crypto, and futures/forex — to a
professional standard.

It is **pure education**. There is no simulator, no portfolio, no trading
mechanics, and nothing that pretends to be a broker. The goal is that a student
finishes with the real foundation — chart reading, strategy, risk management,
market psychology — and can go straight to an external paper-trading platform
with a genuine head start.

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # typecheck + content audit + production build
```

## What's in it

| | |
|---|---|
| **31 lessons** across 6 tracks | Market Foundations, Chart Reading, Strategy, Risk & Psychology, Macro & News Literacy, Your Path Forward |
| **140 quiz questions** | 3–5 per lesson, gating progress to the next one at a 70% pass mark |
| **11 interactive chart exercises** | Mark support/resistance, spot the trend, find the breakout, find the false signal — scored against model answers |
| **128 glossary terms** | Linked contextually from inside every lesson, with hover definitions |
| **16 news stories** | Each paired with a plain-English "why this moves markets" explainer |

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind · Zustand ·
[lightweight-charts](https://www.tradingview.com/lightweight-charts/) for price
charts · Recharts for progress visualisation.

Everything is statically generated. There is no backend, no account, and no
network dependency at runtime.

## Architecture notes

### Content is a typed block tree, not markdown

Lessons live in `src/content/tracks/*.ts` as arrays of typed `Block`s
(`src/lib/content/types.ts`). This buys three things markdown wouldn't:

1. **Contextual glossary linking.** Prose uses `[[term]]` / `[[term|label]]`
   markup, resolved at render time against `src/content/glossary.ts`. A student
   never meets an unexplained word, and renaming a glossary entry can't silently
   break a lesson — `npm run audit` fails instead.
2. **Charts as first-class content.** A lesson can drop an annotated, generated
   candlestick chart inline, which is the entire point of a chart-reading
   course.
3. **Compile-time safety.** A broken `exerciseId` or malformed quiz is a type
   error rather than a dead lesson in production.

Inline markup supported: `**bold**`, `*italic*`, `` `code` ``, `[[term]]`,
`[label](url)`, and `^up^…^` / `^down^…^` for semantically coloured price
language.

### Charts are generated deterministically, with named anchors

`src/lib/market/generate.ts` builds OHLC series from control points plus
mean-reverting noise rather than a pure random walk. That's deliberate: a pure
walk produces *realistic* charts but not *legible* ones, and the structure a
lesson needs to point at (a clean higher low, a neckline, a failed breakout)
would only appear by luck.

Each of the 19 scenarios publishes the exact prices and bar indices of its
structure as **anchors**. Lesson annotations and exercise model answers
reference those anchors by name (`price.resistance`, `bar.breakout`), so a chart
and the thing it is teaching can never drift apart.

Everything downstream is written against the `Series` interface, so swapping in
a live OHLC API means replacing `getSeries()` and touching nothing else.

### Colour rule

`up` / `down` (green / red) are reserved exclusively for market data — candles,
price deltas, P&L. All general UI accent work uses `accent` (blue) or `signal`
(amber), so green and red keep their meaning wherever a student sees them.

Dark mode is the default; both themes are defined as CSS custom properties in
`globals.css` and applied via a pre-paint script so returning light-mode users
never see a flash.

### Progress

`localStorage` via Zustand persist (`src/store/progress.ts`) — no account, no
server, and a student's data never leaves their machine. The store is the only
module that knows how progress is stored, so moving to Prisma/SQLite later means
reimplementing those actions against an API and leaving every consumer
untouched.

### Integration points left open

- **Live market data** — implement against the `Series` shape in
  `src/lib/market/types.ts`.
- **Live news** — implement the `NewsSource` interface in
  `src/lib/news/source.ts` and swap the export. The one field a raw feed won't
  give you is `whyItMoves`, which is what makes the section educational rather
  than a headline dump; it should be written or reviewed by a human.

Neither is required to run the site.

## Content standards

The bar the lessons are written to:

- **Concrete over abstract.** Real numbers, worked examples, actual position
  sizing arithmetic — not "manage your risk carefully".
- **Disagreement is stated, not smoothed over.** Where traders genuinely
  disagree (do repeated tests strengthen a level? is the golden cross useful?
  should you wait for confirmation?), both sides are given.
- **Risk is a main subject, not a disclaimer.** The evidence lesson
  (`risk/the-evidence`) covers Barber & Odean, the Taiwan and Brazil day-trading
  studies, mandatory EU/UK broker loss disclosures and SPIVA — presented as
  professional knowledge, sitting in the middle of the course rather than bolted
  on at the end.

`npm run audit` enforces the structural half of this: every glossary link
resolves, every exercise id exists, lesson slugs are globally unique, news deep
links point at real lessons, and every lesson lands a key takeaway.

## Project layout

```
src/
  app/                routes: /, /learn/[track]/[lesson], /practice, /news,
                      /glossary, /dashboard
  components/
    chart/            lightweight-charts wrapper + overlays
    content/          block renderer, inline markup, hand-built SVG figures
    exercise/         exercise runners and the standalone practice tool
    dashboard/ news/ glossary/ learn/ layout/
  content/
    tracks/           the 31 lessons
    glossary.ts       128 terms — the single source for [[term]] links
    exercises.ts      11 exercises with anchored model answers
    news.ts           sample feed
  lib/
    market/           deterministic OHLC generation
    content/          registry, ordering, navigation
    exercise/ news/
  store/              progress + theme (localStorage)
scripts/audit-content.mjs
```

## Disclaimer

MarketLab is educational material, not financial advice. All charts are
generated for teaching and do not represent real historical prices. The news
feed is illustrative and is labelled as such in the UI.
