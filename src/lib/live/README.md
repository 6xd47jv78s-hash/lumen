# Live market data

Everything in this directory runs **in the browser**. The site is a static
export on GitHub Pages: there is no server, no request-time code, and nowhere to
keep a secret.

That single fact drives every decision here.

## Why the default providers are keyless

An API key in a static build is not a secret. It's compiled into a JavaScript
bundle that anyone can open in devtools and read. There is no configuration that
changes this — not `.env`, not a build variable, not obfuscation. If it reaches
the browser, it's public.

So the defaults are providers that need no key at all:

| Data | Provider | Key | Notes |
|---|---|---|---|
| Crypto candles | Binance `/api/v3/klines` | none | OHLC **and** volume. Answers 451 in some regions, hence the fallback. |
| Crypto candles (fallback) | CoinGecko `/coins/{id}/ohlc` | none | No volume on this endpoint. Fewer regional blocks. |
| Crypto quotes | CoinGecko `/simple/price` → Binance `/ticker/24hr` | none | |
| FX | Frankfurter (ECB reference rates) | none | Daily rates, one price per day — a line, not candles. |
| Headlines | GDELT DOC 2.0 | none | Public news index. |

## Adding a key anyway

`NEXT_PUBLIC_MARKETAUX_KEY` is wired up for news and takes priority over GDELT
when set. Before using it, understand the trade: **that key will be readable by
every visitor.** Only do it with a free-tier key you're willing to have scraped
and can rotate, ideally one restricted by referrer at the provider.

If you need keys to stay private — which is what you'd want for paid stock and
index data — the answer isn't a better variable name, it's a server. Deploy to
Vercel or similar, move these calls into route handlers, and read the key from a
server-side environment variable. The adapters below would barely change; only
the fetch URL moves.

## The two rules every adapter follows

1. **A dead provider never breaks the page.** Callers keep the last good data,
   or fall back to a generated series, and say which they're showing.
2. **Every request is time-boxed.** A hung request is worse than a failed one,
   because the UI would sit in a loading state forever.

## Honesty constraints, deliberately kept

These are not oversights:

- **FX renders as a line, not candles.** The ECB publishes one reference rate
  per day. There is no high, low or volume. Drawing a candle would mean
  inventing three of its four numbers.
- **The volume pane disappears when CoinGecko is the source.** That endpoint has
  no volume. An empty pane is honest; a fabricated one is not.
- **Live headlines get no "why this moves markets" explainer.** That analysis is
  what makes `/news` educational, and generating it automatically would be
  manufacturing commentary and presenting it as editorial — precisely what the
  headline-literacy lesson teaches students to distrust. Live items link to the
  lesson covering the mechanism instead: navigation, not a claim.
- **A fallback chart is labelled `— SAMPLE DATA`** in the chart header, so a
  real ticker never sits above prices that instrument never traded at.

## Testing

`parsers.test.ts` covers the mapping layer against recorded response shapes —
stringly-typed Binance rows, CoinGecko's volume-less OHLC, Frankfurter's
unordered date map, GDELT's non-standard timestamps. The network calls
themselves are not tested: a test that depends on a third-party endpoint being
up fails for reasons that have nothing to do with this code.
