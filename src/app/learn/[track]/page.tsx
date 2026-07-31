import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackIcon } from "@/components/layout/TrackIcon";
import { TrackLessonList } from "@/components/learn/TrackLessonList";
import { ORDERED_TRACKS, getTrack, trackLessons } from "@/lib/content/registry";

interface Params {
  params: { track: string };
}

export function generateStaticParams() {
  return ORDERED_TRACKS.map((t) => ({ track: t.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const track = getTrack(params.track);
  return track ? { title: track.title, description: track.tagline } : {};
}

export default function TrackPage({ params }: Params) {
  const track = getTrack(params.track);
  if (!track) notFound();

  const lessons = trackLessons(track);
  const minutes = lessons.reduce((a, l) => a + l.minutes, 0);
  const idx = ORDERED_TRACKS.findIndex((t) => t.slug === track.slug);
  const nextTrack = ORDERED_TRACKS[idx + 1];

  return (
    // A track page is a table of contents — one column of rows. At the site's
    // full 86rem a lesson title sat a thousand pixels from its own duration,
    // with nothing in between to carry the eye across.
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <Link href="/learn" className="eyebrow transition-colors hover:text-accent">
        ← All courses
      </Link>

      <header className="mt-4 flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-start">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-raised text-accent">
          <TrackIcon icon={track.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{track.title}</h1>
            <span className="eyebrow rounded border border-line bg-raised px-1.5 py-0.5">
              {track.level}
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-[0.975rem] leading-relaxed text-muted">
            {track.description}
          </p>
          <p className="mt-3 font-mono text-2xs text-faint tnum">
            {lessons.length} lessons · {minutes} min · {track.modules.length}{" "}
            {track.modules.length === 1 ? "module" : "modules"}
          </p>
        </div>
      </header>

      <TrackLessonList track={track} />

      {nextTrack && (
        <Link
          href={`/learn/${nextTrack.slug}`}
          className="mt-10 flex items-center gap-4 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-accent/50 hover:bg-raised/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line-strong bg-raised text-accent">
            <TrackIcon icon={nextTrack.icon} />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">Up next</p>
            <p className="mt-1 text-sm font-semibold text-ink">{nextTrack.title}</p>
            <p className="mt-0.5 text-sm text-muted">{nextTrack.tagline}</p>
          </div>
          <span className="ml-auto shrink-0 text-muted" aria-hidden>
            →
          </span>
        </Link>
      )}
    </div>
  );
}
