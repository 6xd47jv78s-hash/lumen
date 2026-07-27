"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ASSET_CLASSES,
  NEWS_CATEGORIES,
  type AssetClass,
  type NewsCategory,
  type NewsStory,
} from "@/content/news";

const IMPACT: Record<NewsStory["impact"], { label: string; cls: string }> = {
  high: { label: "High impact", cls: "border-down/50 text-down" },
  medium: { label: "Medium", cls: "border-signal/50 text-signal" },
  low: { label: "Low", cls: "border-line-strong text-faint" },
};

const ASSET_CLS: Record<AssetClass, string> = {
  Stocks: "border-accent/40 text-accent",
  Crypto: "border-signal/40 text-signal",
  Forex: "border-line-strong text-muted",
  Futures: "border-line-strong text-muted",
  Bonds: "border-line-strong text-muted",
};

function relative(hours: number): string {
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export function NewsFeed({ stories }: { stories: NewsStory[] }) {
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [asset, setAsset] = useState<AssetClass | "all">("all");
  const [open, setOpen] = useState<string | null>(stories[0]?.id ?? null);

  const filtered = useMemo(
    () =>
      stories.filter(
        (s) =>
          (category === "all" || s.category === category) &&
          (asset === "all" || s.assets.includes(asset)),
      ),
    [stories, category, asset],
  );

  return (
    <>
      <div className="mt-7 space-y-3">
        <Filter
          label="Category"
          options={["all", ...NEWS_CATEGORIES]}
          value={category}
          onChange={(v) => setCategory(v as NewsCategory | "all")}
          count={(v) =>
            v === "all" ? stories.length : stories.filter((s) => s.category === v).length
          }
        />
        <Filter
          label="Affects"
          options={["all", ...ASSET_CLASSES]}
          value={asset}
          onChange={(v) => setAsset(v as AssetClass | "all")}
          count={(v) =>
            v === "all" ? stories.length : stories.filter((s) => s.assets.includes(v as AssetClass)).length
          }
        />
      </div>

      <p className="mt-5 font-mono text-2xs text-faint tnum">
        {filtered.length} {filtered.length === 1 ? "story" : "stories"}
      </p>

      <div className="mt-3 space-y-3">
        {filtered.map((story) => {
          const expanded = open === story.id;
          return (
            <article
              key={story.id}
              className={`overflow-hidden rounded-lg border bg-surface transition-colors ${
                expanded ? "border-accent/40" : "border-line hover:border-line-strong"
              }`}
            >
              <button
                onClick={() => setOpen(expanded ? null : story.id)}
                aria-expanded={expanded}
                className="w-full px-5 py-4 text-left"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="eyebrow">{story.category}</span>
                  <span
                    className={`rounded border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider ${IMPACT[story.impact].cls}`}
                  >
                    {IMPACT[story.impact].label}
                  </span>
                  <span className="ml-auto font-mono text-2xs text-faint">
                    {relative(story.hoursAgo)}
                  </span>
                </div>

                <h2 className="mt-2 text-[1.05rem] font-semibold leading-snug tracking-tight text-ink">
                  {story.headline}
                </h2>

                <p className="mt-1.5 text-sm leading-relaxed text-muted">{story.summary}</p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {story.assets.map((a) => (
                    <span
                      key={a}
                      className={`rounded border bg-raised px-1.5 py-0.5 font-mono text-2xs ${ASSET_CLS[a]}`}
                    >
                      {a}
                    </span>
                  ))}
                  <span className="ml-auto flex items-center gap-1 text-xs text-accent">
                    {expanded ? "Hide" : "Why this moves markets"}
                    <span
                      aria-hidden
                      className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                    >
                      ↓
                    </span>
                  </span>
                </div>
              </button>

              {expanded && (
                <div className="animate-fade-up border-t border-line bg-accent-soft/35 px-5 py-4">
                  <p className="eyebrow text-accent">Why this moves markets</p>
                  <p className="mt-2 text-[0.95rem] leading-[1.75] text-ink/90">
                    {story.whyItMoves}
                  </p>
                  {story.lesson && (
                    <Link
                      href={`/learn/${story.lesson.track}/${story.lesson.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      Learn the concept: {story.lesson.title} →
                    </Link>
                  )}
                </div>
              )}
            </article>
          );
        })}

        {filtered.length === 0 && (
          <p className="rounded-lg border border-line bg-surface px-4 py-10 text-center text-sm text-muted">
            No stories match those filters.
          </p>
        )}
      </div>
    </>
  );
}

function Filter<T extends string>({
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
          className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
            value === o
              ? "border-accent/50 bg-accent-soft text-ink"
              : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
          }`}
        >
          {o === "all" ? "All" : o}
          <span className="ml-1.5 font-mono text-2xs text-faint tnum">{count(o)}</span>
        </button>
      ))}
    </div>
  );
}
