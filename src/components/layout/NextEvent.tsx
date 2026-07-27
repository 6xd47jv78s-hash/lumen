"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buildEvents, type MarketEvent } from "@/content/events";
import { formatDelta, phaseOf, useNow } from "@/components/watch/Countdown";

/**
 * The live element in the nav: a countdown to the next high-impact scheduled
 * event. Computed on the client so it is correct however long ago the page was
 * built, and rendered only after mount to keep the static HTML stable.
 */
export function NextEvent() {
  const [next, setNext] = useState<MarketEvent | null>(null);
  const now = useNow(1000);

  useEffect(() => {
    // The nav chip is a glance, so it tracks the next *high-impact* event —
    // the one worth interrupting someone for. The board shows everything.
    const upcoming = buildEvents(new Date(), 30).filter((e) => e.impact === "high");
    setNext(upcoming[0] ?? null);
  }, []);

  if (!next || now === null) return null;
  const phase = phaseOf(next.at, now);
  if (phase === "past") return null;

  const hot = phase === "imminent" || phase === "live";

  return (
    <Link
      href="/watch"
      title={`${next.title} — ${next.region}`}
      className={`hidden items-center gap-2 rounded-md border px-2.5 py-1.5 font-mono text-2xs transition-colors lg:flex ${
        hot
          ? "border-signal/50 bg-signal/10 text-signal hover:border-signal"
          : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${hot ? "animate-pulse bg-signal" : "bg-down"}`}
      />
      <span className="font-semibold">{next.short}</span>
      <span className="tnum">{formatDelta(next.at, now)}</span>
    </Link>
  );
}
