"use client";

import Link from "next/link";
import { useCallback } from "react";
import { LiveFailureNote, LiveStatus } from "./LiveStatus";
import { useLive } from "@/hooks/useLive";
import { getLiveHeadlines, type LiveHeadline } from "@/lib/live/news";

function relative(ts: number): string {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

/**
 * Live headline wire.
 *
 * What it deliberately does not do is generate a "why this moves markets"
 * explainer for each item. That analysis is what makes the curated feed
 * educational, and manufacturing it automatically would be inventing commentary
 * and presenting it as editorial — the exact failure mode the headline-literacy
 * lesson teaches students to spot.
 *
 * Instead each item gets what can be said truthfully: headline, source, time,
 * and a link to the lesson covering the mechanism it touches.
 */
export function LiveWire() {
  const load = useCallback(() => getLiveHeadlines(24), []);
  const state = useLive<LiveHeadline[]>(load, { refreshMs: 5 * 60_000 });

  return (
    <section className="rounded-lg border border-line bg-surface">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-ink">Live wire</h2>
          <p className="text-xs text-faint">Market headlines as they land</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <LiveStatus state={state} fallbackLabel="unavailable" />
          <button
            onClick={state.refresh}
            className="font-mono text-2xs text-accent hover:underline"
          >
            refresh
          </button>
        </div>
      </header>

      {state.status === "loading" && (
        <div className="space-y-3 p-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-3 w-1/4 rounded bg-line" />
              <div className="h-4 w-full rounded bg-line" />
            </div>
          ))}
        </div>
      )}

      {state.data && (
        <ul className="thin-scroll max-h-[34rem] divide-y divide-line overflow-y-auto">
          {state.data.map((item) => (
            <li key={item.id} className="px-4 py-3 transition-colors hover:bg-raised/50">
              <div className="flex items-baseline gap-2 font-mono text-2xs text-faint">
                <span className="truncate">{item.source}</span>
                <span aria-hidden>·</span>
                <span className="tnum">{relative(item.publishedAt)}</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm leading-snug text-ink hover:text-accent"
              >
                {item.title}
              </a>
              {item.lesson && (
                <Link
                  href={`/learn/${item.lesson.track}/${item.lesson.slug}`}
                  className="mt-1.5 inline-block text-xs text-accent hover:underline"
                >
                  Related: {item.lesson.title} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-line px-4 py-3">
        <LiveFailureNote state={state} />
        <p className="text-xs leading-relaxed text-faint">
          Headlines come from a public news index and are shown unedited. MarketLab doesn&rsquo;t
          endorse any of them, and a headline appearing here is not a reason to act — the{" "}
          <Link href="/learn/macro/headline-literacy" className="link">
            headline-literacy lesson
          </Link>{" "}
          covers how to tell which of these matter.{" "}
          <Link href="/news" className="link">
            The explained feed
          </Link>{" "}
          pairs stories with the mechanism instead.
        </p>
      </div>
    </section>
  );
}
