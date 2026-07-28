import type { Metadata } from "next";
import Link from "next/link";
import { EventBoard } from "@/components/watch/EventBoard";
import { SnapshotBar } from "@/components/watch/SnapshotBar";
import { getEvents } from "@/lib/events/source";
import { getQuotes, quoteSource } from "@/lib/market/quotes";

export const metadata: Metadata = {
  title: "Market Watch",
  description:
    "Live countdowns to the scheduled events that move markets — central bank decisions, inflation and jobs data, earnings — with what to watch for in each.",
};

/**
 * The server list is only a first paint — `EventBoard` recomputes the schedule
 * on mount, so the board is correct however long ago the page was built. That's
 * what lets this work as a fully static export with no revalidation.
 */
export default async function WatchPage() {
  const [events, quotes] = await Promise.all([getEvents(45), getQuotes()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <p className="eyebrow">Market Watch</p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink">
          When markets are going to move
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
          The biggest moves of the month are almost always scheduled in advance. This board counts
          down to them and tells you what each one actually measures — so you know when volatility
          is coming and what to look for when it arrives.
        </p>
      </header>

      <div className="mt-6 rounded-lg border border-accent/35 bg-accent-soft/40 px-4 py-3.5">
        <p className="eyebrow text-accent">What this is, and what it isn&rsquo;t</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
          This tells you <strong>when</strong> markets are likely to move and <strong>why</strong>.
          It will never tell you what to buy, when to buy it, or what anyone else is buying — and
          you should be suspicious of anything that does.{" "}
          <Link href="/learn/risk/following-others" className="link">
            Here&rsquo;s why that matters
          </Link>
          . Deciding what to do is your trading plan&rsquo;s job, and building one is what the{" "}
          <Link href="/learn/strategy" className="link">
            Strategy track
          </Link>{" "}
          is for.
        </p>
      </div>

      <SnapshotBar quotes={quotes} isLive={quoteSource.isLive} asOf={quoteSource.asOf} />

      <EventBoard initialEvents={events} />

      <p className="mt-8 rounded-lg border border-line bg-raised/40 px-4 py-3 text-xs leading-relaxed text-faint">
        Dates marked <span className="font-mono">est. date</span> are placeholders generated from
        typical release patterns — a live calendar feed would replace them. US payrolls (first
        Friday) and monthly crypto options expiry (last Friday) follow stable published
        conventions. Always confirm timings against an official source before relying on them.
      </p>
    </div>
  );
}
