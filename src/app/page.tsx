import Link from "next/link";
import { ContinueBar, type LessonStub } from "@/components/home/ContinueBar";
import { HeroChart } from "@/components/home/HeroChart";
import { TrackCard } from "@/components/layout/TrackCard";
import {
  ALL_LESSONS,
  ORDERED_TRACKS,
  TOTAL_LESSONS,
  TOTAL_MINUTES,
  TOTAL_QUESTIONS,
  trackLessons,
} from "@/lib/content/registry";
import { EXERCISES } from "@/content/exercises";
import { GLOSSARY } from "@/content/glossary";

export default function HomePage() {
  const stubs: LessonStub[] = ALL_LESSONS.map((l) => ({
    slug: l.lesson.slug,
    title: l.lesson.title,
    track: l.track.title,
    trackSlug: l.track.slug,
    minutes: l.lesson.minutes,
  }));

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="border-b border-line bg-gradient-to-b from-raised/50 to-transparent">
        <div className="mx-auto grid max-w-[86rem] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
          <div>
            <p className="eyebrow">Markets, taught properly</p>
            <h1 className="mt-3 text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[2.9rem]">
              Learn how markets
              <br />
              actually work.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-snug text-ink/80">
              So when you&rsquo;re ready to trade, you&rsquo;re not starting from zero.
            </p>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-muted">
              A full course in chart reading, strategy, risk management and market psychology,
              written the way traders actually think about it. Not a simulator, not a hype channel —
              the foundation professionals are built on, before you risk a single pound.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/learn/foundations/what-is-a-market" className="btn-primary">
                Start the first lesson
              </Link>
              <Link href="/practice" className="btn-ghost">
                Try a chart exercise
              </Link>
            </div>

            <dl className="mt-9 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {[
                [TOTAL_LESSONS, "lessons"],
                [TOTAL_QUESTIONS, "quiz questions"],
                [EXERCISES.length, "chart exercises"],
                [GLOSSARY.length, "glossary terms"],
              ].map(([n, label]) => (
                <div key={label as string}>
                  <dt className="font-mono text-xl text-ink tnum">{n}</dt>
                  <dd className="eyebrow mt-0.5">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroChart />
        </div>
      </section>

      <ContinueBar ordered={stubs} />

      {/* ---------------------------------------------------------- tracks */}
      <section className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">The curriculum</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
              Six tracks, in order. The first two build the foundation everything else stands on;
              Risk &amp; Psychology is the one that decides whether any of it works in practice.
            </p>
          </div>
          <span className="font-mono text-2xs text-faint tnum">
            ~{Math.round(TOTAL_MINUTES / 60)} hours of reading
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDERED_TRACKS.map((track) => {
            const lessons = trackLessons(track);
            return (
              <TrackCard
                key={track.slug}
                track={track}
                lessonSlugs={lessons.map((l) => l.slug)}
                minutes={lessons.reduce((a, l) => a + l.minutes, 0)}
              />
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------ principles */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            How this is different from most &ldquo;learn to trade&rdquo; material
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              {
                t: "It tells you where the disagreement is",
                d: "Traders genuinely disagree about which indicators work, whether to wait for confirmation, and how much technical analysis is self-fulfilling. Where there's a real argument, you get both sides — not a confident answer that happens to be one person's habit.",
              },
              {
                t: "Risk is taught as the main subject",
                d: "Most material treats risk management as a disclaimer at the end. Here it's a full track with the actual arithmetic, because position sizing is what separates traders who last from traders who have a good month.",
              },
              {
                t: "No simulator, no portfolio, no gamification",
                d: "There's nothing here that pretends to be trading. You learn the material, test yourself on real chart problems, and then go practise on a proper paper-trading platform with a genuine head start.",
              },
            ].map((c) => (
              <div key={c.t}>
                <h3 className="text-sm font-semibold text-ink">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- practice */}
      <section className="mx-auto max-w-[86rem] px-4 py-14 sm:px-6">
        <div className="grid gap-6 rounded-lg border border-line bg-surface p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
          <div>
            <p className="eyebrow">Interactive practice</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
              Reading a chart is a skill, so you practise it
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Mark support and resistance on a live chart and get scored against a model answer.
              Find the breakout. Find the bar that trapped everyone. Every exercise ends with the
              reasoning, not just a tick or a cross.
            </p>
            <Link href="/practice" className="btn-primary mt-5">
              Open the practice tool
            </Link>
          </div>
          <ul className="grid gap-2.5 self-center">
            {[
              ["Spot the trend", "Read structure, not vibes"],
              ["Mark support & resistance", "Scored against model zones"],
              ["Identify the breakout", "Close, range and volume together"],
              ["Find the false signal", "The one that separates readers from traders"],
            ].map(([t, d]) => (
              <li key={t} className="flex items-baseline gap-3 rounded-md border border-line bg-raised/50 px-3.5 py-2.5">
                <span className="text-sm font-medium text-ink">{t}</span>
                <span className="ml-auto text-right text-xs text-faint">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
