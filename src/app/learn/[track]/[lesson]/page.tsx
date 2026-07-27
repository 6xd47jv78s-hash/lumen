import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks } from "@/components/content/Blocks";
import { LessonSidebar } from "@/components/learn/LessonSidebar";
import { MobileContents } from "@/components/learn/MobileContents";
import { Quiz } from "@/components/learn/Quiz";
import { ALL_LESSONS, getLessonRef, neighbours } from "@/lib/content/registry";

interface Params {
  params: { track: string; lesson: string };
}

export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ track: l.track.slug, lesson: l.lesson.slug }));
}

export function generateMetadata({ params }: Params): Metadata {
  const ref = getLessonRef(params.lesson);
  if (!ref) return {};
  return {
    title: ref.lesson.title,
    description: ref.lesson.subtitle ?? ref.track.tagline,
  };
}

export default function LessonPage({ params }: Params) {
  const ref = getLessonRef(params.lesson);
  if (!ref || ref.track.slug !== params.track) notFound();

  const { track, module, lesson } = ref;
  const { prev, next } = neighbours(lesson.slug);
  const position = module.lessons.findIndex((l) => l.slug === lesson.slug) + 1;

  return (
    <div className="mx-auto flex max-w-[86rem] gap-10 px-4 py-8 sm:px-6 lg:py-12">
      <aside className="sticky top-20 hidden h-fit w-60 shrink-0 lg:block">
        <LessonSidebar track={track} current={lesson.slug} />
      </aside>

      <article className="min-w-0 flex-1 lg:max-w-prose">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={`/learn/${track.slug}`} className="eyebrow transition-colors hover:text-accent">
            {track.title}
          </Link>
          <span className="eyebrow" aria-hidden>
            /
          </span>
          <span className="eyebrow">
            {module.title} · {position} of {module.lessons.length}
          </span>
          <span className="ml-auto font-mono text-2xs text-faint tnum">
            {lesson.minutes} min read
          </span>
        </div>

        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight text-ink sm:text-[2rem]">
          {lesson.title}
        </h1>
        {lesson.subtitle && (
          <p className="mt-2.5 text-base leading-relaxed text-muted">{lesson.subtitle}</p>
        )}

        <hr className="my-7 border-line" />

        <MobileContents track={track} current={lesson.slug} />

        <div className="-mt-4">
          <Blocks blocks={lesson.blocks} />
        </div>

        <Quiz
          lessonSlug={lesson.slug}
          questions={lesson.quiz}
          next={
            next
              ? { href: `/learn/${next.track.slug}/${next.lesson.slug}`, title: next.lesson.title }
              : null
          }
        />

        <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Lesson navigation">
          {prev ? (
            <Link
              href={`/learn/${prev.track.slug}/${prev.lesson.slug}`}
              className="group rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-raised/60"
            >
              <span className="eyebrow">← Previous</span>
              <p className="mt-1.5 text-sm font-medium text-ink">{prev.lesson.title}</p>
              {prev.track.slug !== track.slug && (
                <p className="mt-0.5 text-xs text-faint">{prev.track.title}</p>
              )}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/learn/${next.track.slug}/${next.lesson.slug}`}
              className="group rounded-lg border border-line bg-surface p-4 text-right transition-colors hover:border-line-strong hover:bg-raised/60 sm:col-start-2"
            >
              <span className="eyebrow">Next →</span>
              <p className="mt-1.5 text-sm font-medium text-ink">{next.lesson.title}</p>
              {next.track.slug !== track.slug && (
                <p className="mt-0.5 text-xs text-faint">{next.track.title}</p>
              )}
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
