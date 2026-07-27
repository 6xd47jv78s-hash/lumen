import type { Metadata } from "next";
import { Dashboard, type TrackSummary } from "@/components/dashboard/Dashboard";
import { EXERCISES } from "@/content/exercises";
import { ORDERED_TRACKS, TOTAL_QUESTIONS, trackLessons } from "@/lib/content/registry";

export const metadata: Metadata = {
  title: "Your progress",
  description: "Lessons completed, quiz accuracy, study streak and chart-practice results.",
};

export default function DashboardPage() {
  const tracks: TrackSummary[] = ORDERED_TRACKS.map((t) => ({
    slug: t.slug,
    title: t.title,
    level: t.level,
    lessons: trackLessons(t).map((l) => ({
      slug: l.slug,
      title: l.title,
      minutes: l.minutes,
    })),
  }));

  const exercises = EXERCISES.map((e) => ({ id: e.id, mode: e.mode, title: e.title }));

  return (
    <div className="mx-auto max-w-[72rem] px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <p className="eyebrow">Your progress</p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-[1.02rem] leading-relaxed text-muted">
          Where you are, what you&rsquo;ve scored, and which chart-reading skills still need work.
        </p>
      </header>

      <Dashboard tracks={tracks} exercises={exercises} totalQuestions={TOTAL_QUESTIONS} />
    </div>
  );
}
