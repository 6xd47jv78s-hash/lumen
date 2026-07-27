import type { Metadata } from "next";
import Link from "next/link";
import { PracticeTool } from "@/components/exercise/PracticeTool";
import { getTrack, trackLessons } from "@/lib/content/registry";

export const metadata: Metadata = {
  title: "Chart practice",
  description:
    "Interactive chart-reading exercises: spot the trend, mark support and resistance, identify the breakout, and find the false signal — scored against model answers.",
};

export default function PracticePage() {
  const chartTrack = getTrack("chart-reading");
  const slugs = chartTrack ? trackLessons(chartTrack).map((l) => l.slug) : [];

  return (
    <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 lg:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow">Interactive</p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink">Chart practice</h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
          Reading a chart is a motor skill as much as a knowledge one — you get it by doing it
          repeatedly and finding out when you were wrong. Every exercise is scored against a model
          answer and ends with the reasoning, not just a verdict.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-faint">
          All charts are generated, so the structure is unambiguous and the model answer is exact.
          The reasoning transfers directly to real charts —{" "}
          <Link href="/learn/chart-reading" className="link">
            the Chart Reading track
          </Link>{" "}
          teaches the underlying method.
        </p>
      </header>

      <PracticeTool chartLessonSlugs={slugs} />
    </div>
  );
}
