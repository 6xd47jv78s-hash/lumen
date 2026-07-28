# MarketLab

An interactive education platform that teaches 14–18 year olds how to read and
understand financial markets — stocks, crypto, and futures/forex — to a
professional standard.

It is **pure education**. There is no simulator, no portfolio, no trading
mechanics, and nothing that pretends to be a broker. The goal is that a student
finishes with the real foundation — chart reading, strategy, risk management,
market psychology — and can go straight to an external paper-trading platform
with a genuine head start.

## Running it

Needs Node 18.18 or newer (`node -v` to check).

```bash
git clone https://github.com/6xd47jv78s-hash/lumen.git
cd lumen
git checkout claude/marketlab-education-platform-oan1lz
npm install
npm run dev        # then open http://localhost:3000
```

The first page you open takes a few seconds to compile in dev; after that it's
instant. Nothing else is required — no API keys, no database, no account. To
serve the optimised build instead, `npm run build && npm start`.

```bash
npm test           # 266 assertions, no test framework dependency
npm run check      # typecheck + lint + tests + content audit + build + site audit
```

## Deploying

The app has no backend, so it can ship either as a Node server build or as a
pile of static files.

**GitHub Pages** is live at
[6xd47jv78s-hash.github.io/lumen](https://6xd47jv78s-hash.github.io/lumen/), and
needs no setup at all. `.github/workflows/deploy.yml` runs the checks, builds a
static export and force-pushes it to the `gh-pages` branch on every push to
`main` or the feature branch. Base path and site URL are derived from the
repository name, so nothing is hardcoded.

It publishes via the branch rather than the Pages deployment API on purpose.
Creating a Pages site through the API requires repo-admin credentials, which a
workflow's automatic `GITHUB_TOKEN` does not have — `actions/configure-pages`
fails with `Resource not accessible by integration`, and the alternative is
asking a human to flip **Settings → Pages → Source → “GitHub Actions”**. Pushing
a `gh-pages` branch enables Pages by itself, so the whole thing is automatic.

**Anywhere else.** Vercel, Netlify, Cloudflare Pages or your own box all work
with no configuration beyond `NEXT_PUBLIC_SITE_URL`, which feeds canonical
metadata, the social card, `sitemap.xml` and `robots.txt`.

### Build modes

| | Command | Output |
|---|---|---|
| Server build (default) | `npm run build && npm start` | `.next/`, served by Node |
| Static export | `npm run export` | `out/`, plain files |

`NEXT_BASE_PATH` handles hosting under a subdirectory (`github.io/<repo>`)
rather than at a domain root. Export mode is opt-in rather than the default
because `next start` — which `npm run audit:site` drives — can't serve an
export.

## What's in it

| | |
|---|---|
| **32 lessons** across 6 tracks | Market Foundations, Chart Reading, Strategy, Risk & Psychology, Macro & News Literacy, Your Path Forward |
| **145 quiz questions** | 3–5 per lesson, gating progress to the next one at a 70% pass mark |
| **11 interactive chart exercises** | Mark support/resistance, spot the trend, find the breakout, find the false signal — scored against model answers |
| **130 glossary terms** | Linked contextually from inside every lesson, with hover definitions |
| **16 news stories** | Each paired with a plain-English "why this moves markets" explainer |
| **Market Watch** | Live countdowns to scheduled market-moving events, with opt-in browser alerts |

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

### The line Market Watch does not cross

`/watch` is live and timed: countdowns to scheduled events, a nav chip tracking
the next high-impact release, opt-in browser alerts, and a market snapshot bar.

It deliberately answers **when markets are likely to move and why**, and never
**what to buy**. That constraint is architectural, not cosmetic:

- Every event carries `whyWatched` and `watchFor` — mechanisms and things to
  observe. There is no field in `MarketEvent` capable of holding a direction or
  an instrument recommendation.
- Alert notification bodies name a scheduled event or a study habit. Nothing
  else can reach them.
- The snapshot bar is framed as regime context, and sample values are badged
  `SAMPLE DATA` in the bar itself — a number reads as authoritative in a way a
  headline doesn't, so an unbadged placeholder price would mislead.

The reasoning is taught, not just enforced: `risk/following-others` covers why
signal services, copied positions and 13F filings fail, and `/watch` links to it
from the top of the page.

### Integration points left open

- **Live market data (charts)** — implement against the `Series` shape in
  `src/lib/market/types.ts`.
- **Live news** — implement `NewsSource` in `src/lib/news/source.ts`. The field
  a raw feed won't give you is `whyItMoves`, which is what makes the section
  educational rather than a headline dump; write or review it by hand.
- **Live economic calendar** — implement `EventSource` in
  `src/lib/events/source.ts`. Same caveat: `whyWatched` and `watchFor` are
  editorial. Until then the board is generated from recurrence rules so it is
  always current, and placeholder dates are badged `est. date` in the UI.
- **Live quotes** — implement `QuoteSource` in `src/lib/market/quotes.ts`.

None are required to run the site.

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
resolves, every exercise id exists, lesson slugs are globally unique, every deep
link from news, events and pages points at a real lesson, and every lesson lands
a key takeaway.

## Verification

`npm run check` runs the whole chain: typecheck → lint → tests → content audit →
build → rendered-site audit. Each layer catches something the others can't.

**`npm test`** (266 assertions, `node --test` via tsx — no test framework
dependency). The parts worth testing here aren't the components, they're the
things that can go silently wrong:

- **The chart generator.** OHLC invariants on every bar of every scenario,
  determinism per seed, and scenario-specific structural claims — that the
  fakeout's trap bar really does close back below resistance, that the
  breakout bar really does close above it on expanded volume, that the uptrend's
  swings really do make higher highs and higher lows. This caught a real bug:
  `touch()` shifted a candle's body to land on a level without re-deriving its
  wicks, producing candles whose body escaped its own wick in five scenarios.
- **Exercise model answers.** Every levels target is verified to be a price the
  chart actually reacts at more than once, and targets are checked to sit
  further apart than twice the grading tolerance so one line can't match two.
  Bar-exercise traps are checked not to overlap the answer window, which would
  otherwise score the same click as both correct and a near-miss depending on
  evaluation order. Without this, a generator tweak can silently start marking
  correct answers wrong.
- **Course structure.** Quiz answer indices in range (an out-of-range index
  renders a check that can never be passed, silently locking the rest of a
  track), unique slugs and question ids, exactly one key takeaway per lesson and
  it closes the lesson, no stub prose, table rows matching their headers.
- **Event recurrence**, across 26 different start dates so month lengths and
  week alignments are actually exercised: payrolls always land on the first
  Friday, crypto expiry on the last, and the `ruleBased` flag agrees with
  whether a schedule is a real convention. One test greps every event's copy for
  directional language, which makes the "never what to buy" promise
  machine-checkable rather than a matter of care.

**`npm run audit:site`** starts the production server and crawls every
internally-linked page, checking delivered HTML for broken links, missing page
metadata, skipped heading levels, unnamed controls, unlabelled inputs,
undecorated icon SVGs and `target="_blank"` without `rel="noopener"`. It's
regex-over-HTML rather than a headless browser, so it needs no browser download
in CI — the trade-off being that layout and client-only behaviour still want a
real browser pass. It refuses to run if something is already on its port, since
silently auditing a stale build is worse than not auditing at all.

Current state: zero findings across all layers. A browser pass at 1280px and
390px (heading order, focus visibility, horizontal overflow) is also clean.

## Project layout

```
src/
  app/                routes: /, /learn/[track]/[lesson], /practice, /watch,
                      /news, /glossary, /dashboard
  components/
    chart/            lightweight-charts wrapper + overlays
    content/          block renderer, inline markup, hand-built SVG figures
    exercise/         exercise runners and the standalone practice tool
    watch/            event board, countdowns, alert settings, snapshot bar
    alerts/           notification runner, mounted once in the root layout
    dashboard/ news/ glossary/ learn/ layout/
  content/
    tracks/           the 32 lessons
    glossary.ts       130 terms — the single source for [[term]] links
    exercises.ts      11 exercises with anchored model answers
    news.ts           sample feed
    events.ts         event templates + recurrence rules
  lib/
    market/           deterministic OHLC generation, quote source
    content/          registry, ordering, navigation
    events/ exercise/ news/
  store/              progress + theme + alert prefs (localStorage)
scripts/
  audit-content.mjs   source-level content checks
  audit-site.mjs      crawls the built site over HTTP
src/**/*.test.ts      node:test suites, run via tsx
```

## Disclaimer

MarketLab is educational material, not financial advice, and it never issues
buy or sell recommendations. All charts are generated for teaching and do not
represent real historical prices. The news feed, the market snapshot and any
event date badged `est. date` are illustrative and are labelled as such in the
UI. Confirm event timings against an official source before relying on them.
