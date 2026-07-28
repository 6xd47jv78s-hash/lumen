import type { Metadata } from "next";
import Link from "next/link";
import { LiveChartPanel } from "@/components/live/LiveChartPanel";
import { LiveWire } from "@/components/live/LiveWire";

export const metadata: Metadata = {
  title: "Live markets",
  description:
    "Real market data and a live headline wire — for applying what the course teaches to charts that are actually moving.",
};

export default function LivePage() {
  return (
    <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 lg:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">Live markets</p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink">
          The real thing, to practise on
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
          Everything else on this site uses generated charts, because teaching structure needs
          charts where the structure is unambiguous. This page is the opposite: real prices,
          real headlines, no tidying up. It&rsquo;s where you find out whether you can read a
          chart that nobody designed to be readable.
        </p>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-accent/35 bg-accent-soft/40 px-4 py-3.5">
          <p className="eyebrow text-accent">How to use this</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
            Mark the structure before you read the news, not after. Find the swing highs and lows,
            the levels price keeps reacting to, whether volume confirms the last move. Then check
            the wire. Doing it in that order is the whole exercise — it&rsquo;s how you learn
            whether you&rsquo;re reading the chart or reading your feelings.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-4 py-3.5">
          <p className="eyebrow">Still not a trading tool</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            There&rsquo;s no order ticket here and there never will be. Live data is for practising
            the reading, and the{" "}
            <Link href="/learn/risk/following-others" className="link">
              signals lesson
            </Link>{" "}
            explains why a chart plus a headline is not a reason to act. Decisions come from a{" "}
            <Link href="/learn/strategy/trading-plan" className="link">
              written plan
            </Link>
            , not from a screen.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <LiveChartPanel />
        <LiveWire />
      </div>

      <p className="mt-8 rounded-lg border border-line bg-raised/40 px-4 py-3 text-xs leading-relaxed text-faint">
        Data comes from free public endpoints — CoinGecko and Binance for crypto, the European
        Central Bank&rsquo;s published reference rates for FX, and a public news index for
        headlines. No account, no API key, nothing about you sent anywhere. Each panel names the
        provider it&rsquo;s using and how old the data is; if a provider is rate-limiting or
        blocked on your network, the panel says so and falls back rather than showing you a stale
        number as though it were current.
      </p>
    </div>
  );
}
