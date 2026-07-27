import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-5xl text-line-strong tnum">404</p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
        No position here
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        This page doesn&rsquo;t exist. It may have been renamed, or the link may be wrong.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/learn" className="btn-primary">
          Browse the courses
        </Link>
        <Link href="/glossary" className="btn-ghost">
          Search the glossary
        </Link>
      </div>
    </div>
  );
}
