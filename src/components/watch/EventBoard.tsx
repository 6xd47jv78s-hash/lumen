"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertSettings } from "./AlertSettings";
import { Countdown, LocalTime, phaseOf, useNow } from "./Countdown";
import { EVENT_KIND_LABEL, buildEvents, type EventKind, type MarketEvent } from "@/content/events";
import type { AssetClass } from "@/content/news";
import { ASSET_CLASSES } from "@/content/news";

const IMPACT: Record<MarketEvent["impact"], { label: string; cls: string; dot: string }> = {
  high: { label: "High impact", cls: "border-down/50 text-down", dot: "bg-down" },
  medium: { label: "Medium", cls: "border-signal/50 text-signal", dot: "bg-signal" },
  low: { label: "Low", cls: "border-line-strong text-faint", dot: "bg-line-strong" },
};

export function EventBoard({ initialEvents }: { initialEvents: MarketEvent[] }) {
  // The page may have been statically generated hours or days ago, so recompute
  // the schedule on the client. The server list keeps the first paint useful.
  const [events, setEvents] = useState(initialEvents);
  useEffect(() => setEvents(buildEvents(new Date(), 45)), []);

  const [impact, setImpact] = useState<MarketEvent["impact"] | "all">("all");
  const [asset, setAsset] = useState<AssetClass | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const now = useNow(1000);

  const visible = useMemo(
    () =>
      events.filter(
        (e) =>
          (impact === "all" || e.impact === impact) &&
          (asset === "all" || e.assets.includes(asset)) &&
          (now === null || phaseOf(e.at, now) !== "past"),
      ),
    [events, impact, asset, now],
  );

  // Genuinely the next one. Preferring the next *high-impact* event would make
  // the panel contradict the board directly beneath it.
  const next = visible[0];

  const groups = useMemo(() => groupByDay(visible, now), [visible, now]);

  return (
    <>
      {/* ------------------------------------------------------- next event */}
      {next && (
        <section className="mt-7 overflow-hidden rounded-lg border border-accent/40 bg-accent-soft/40">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="eyebrow text-accent">Next scheduled event</p>
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider ${IMPACT[next.impact].cls}`}
                >
                  {IMPACT[next.impact].label}
                </span>
              </div>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-ink">{next.title}</h2>
              <p className="mt-1 font-mono text-2xs text-muted">
                <LocalTime at={next.at} /> · your local time · {next.region}
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <Countdown
                at={next.at}
                prefix=""
                className="block font-mono text-3xl font-semibold text-accent tnum"
              />
              <span className="eyebrow">until release</span>
            </div>
          </div>
          <p className="border-t border-accent/25 bg-base/30 px-5 py-3 text-sm leading-relaxed text-muted">
            {next.whyWatched}
          </p>
        </section>
      )}

      {/* --------------------------------------------------------- filters */}
      <div className="mt-7 space-y-3">
        <Filters
          label="Impact"
          options={["all", "high", "medium", "low"] as const}
          value={impact}
          onChange={(v) => setImpact(v as MarketEvent["impact"] | "all")}
          count={(v) => (v === "all" ? visible.length : events.filter((e) => e.impact === v).length)}
        />
        <Filters
          label="Affects"
          options={["all", ...ASSET_CLASSES] as const}
          value={asset}
          onChange={(v) => setAsset(v as AssetClass | "all")}
          count={(v) =>
            v === "all"
              ? visible.length
              : events.filter((e) => e.assets.includes(v as AssetClass)).length
          }
        />
      </div>

      <AlertSettings events={events} />

      {/* ----------------------------------------------------------- board */}
      <div className="mt-8 space-y-8">
        {groups.map((group) => (
          <section key={group.label}>
            <div className="flex items-baseline gap-3">
              <h2 className="text-sm font-semibold text-ink">{group.label}</h2>
              <span className="font-mono text-2xs text-faint tnum">
                {group.events.length} {group.events.length === 1 ? "event" : "events"}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {group.events.map((e) => {
                const expanded = open === e.id;
                const phase = now === null ? "future" : phaseOf(e.at, now);
                return (
                  <article
                    key={e.id}
                    className={`overflow-hidden rounded-lg border bg-surface transition-colors ${
                      phase === "live" || phase === "imminent"
                        ? "border-signal/50"
                        : expanded
                          ? "border-accent/40"
                          : "border-line hover:border-line-strong"
                    }`}
                  >
                    <button
                      onClick={() => setOpen(expanded ? null : e.id)}
                      aria-expanded={expanded}
                      className="w-full px-4 py-3.5 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          aria-hidden
                          className={`h-1.5 w-1.5 rounded-full ${IMPACT[e.impact].dot} ${
                            phase === "imminent" ? "animate-pulse" : ""
                          }`}
                        />
                        <span className="eyebrow">{EVENT_KIND_LABEL[e.kind]}</span>
                        <span
                          className={`rounded border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider ${IMPACT[e.impact].cls}`}
                        >
                          {IMPACT[e.impact].label}
                        </span>
                        {!e.ruleBased && (
                          <span
                            className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-2xs text-faint"
                            title="Placeholder date — a live calendar feed would replace it"
                          >
                            est. date
                          </span>
                        )}
                        <span className="ml-auto flex items-center gap-2 font-mono text-2xs">
                          <span className="text-faint">
                            <LocalTime at={e.at} withDate={false} />
                          </span>
                          <Countdown
                            at={e.at}
                            className={`tnum ${
                              phase === "imminent" || phase === "live" ? "text-signal" : "text-muted"
                            }`}
                          />
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <span className="font-mono text-2xs text-faint">{e.region}</span>
                        <h3 className="text-[0.95rem] font-semibold tracking-tight text-ink">
                          {e.title}
                        </h3>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {e.previous && (
                          <span className="font-mono text-2xs text-faint">
                            prev <span className="text-muted">{e.previous}</span>
                          </span>
                        )}
                        {e.consensus && (
                          <span className="font-mono text-2xs text-faint">
                            cons <span className="text-muted">{e.consensus}</span>
                          </span>
                        )}
                        {e.assets.map((a) => (
                          <span
                            key={a}
                            className="rounded border border-line bg-raised px-1.5 py-0.5 font-mono text-2xs text-muted"
                          >
                            {a}
                          </span>
                        ))}
                        <span className="ml-auto text-xs text-accent">
                          {expanded ? "Hide" : "What to watch"} {expanded ? "↑" : "↓"}
                        </span>
                      </div>
                    </button>

                    {expanded && (
                      <div className="animate-fade-up border-t border-line bg-raised/50 px-4 py-4">
                        <p className="text-sm leading-relaxed text-muted">{e.whyWatched}</p>
                        <p className="eyebrow mt-4">What to watch for</p>
                        <ul className="mt-2 space-y-1.5">
                          {e.watchFor.map((w, i) => (
                            <li
                              key={i}
                              className="relative pl-4 text-sm leading-relaxed text-muted"
                            >
                              <span aria-hidden className="absolute left-0 text-line-strong">
                                —
                              </span>
                              {w}
                            </li>
                          ))}
                        </ul>
                        {e.lesson && (
                          <Link
                            href={`/learn/${e.lesson.track}/${e.lesson.slug}`}
                            className="mt-3 inline-flex text-sm text-accent hover:underline"
                          >
                            Learn the mechanism: {e.lesson.title} →
                          </Link>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {visible.length === 0 && (
          <p className="rounded-lg border border-line bg-surface px-4 py-10 text-center text-sm text-muted">
            No events match those filters in the next 45 days.
          </p>
        )}
      </div>
    </>
  );
}

function Filters<T extends string>({
  label,
  options,
  value,
  onChange,
  count,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  count: (v: T) => number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="eyebrow w-16 shrink-0">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-md border px-2.5 py-1.5 text-xs capitalize transition-colors ${
            value === o
              ? "border-accent/50 bg-accent-soft text-ink"
              : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
          }`}
        >
          {o === "all" ? "All" : o}
          <span className="ml-1.5 font-mono text-2xs normal-case text-faint tnum">{count(o)}</span>
        </button>
      ))}
    </div>
  );
}

function groupByDay(events: MarketEvent[], now: number | null) {
  const base = now ?? Date.now();
  const today = new Date(base);
  today.setHours(0, 0, 0, 0);
  const dayMs = 86400000;

  const buckets = new Map<string, MarketEvent[]>();
  for (const e of events) {
    const d = new Date(e.at);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - today.getTime()) / dayMs);
    const label =
      diff <= 0
        ? "Today"
        : diff === 1
          ? "Tomorrow"
          : diff <= 7
            ? "This week"
            : diff <= 14
              ? "Next week"
              : "Later this month and beyond";
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(e);
  }

  const order = ["Today", "Tomorrow", "This week", "Next week", "Later this month and beyond"];
  return order
    .filter((l) => buckets.has(l))
    .map((label) => ({ label, events: buckets.get(label)! }));
}
