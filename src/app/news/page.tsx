import type { Metadata } from "next";
import { NewsFeed } from "@/components/news/NewsFeed";
import { getNews, newsSource } from "@/lib/news/source";

export const metadata: Metadata = {
  title: "Market news",
  description:
    "Market stories paired with a plain-English explanation of the mechanism connecting each headline to prices.",
};

export default async function NewsPage() {
  const stories = await getNews();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <p className="eyebrow">Market news</p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink">
          Headlines, and why they move markets
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
          Reading market news is a skill in itself: most headlines are noise, and the ones that
          matter often move prices in a direction that looks backwards until you know the
          mechanism. Every story here comes with that mechanism spelled out.
        </p>
      </header>

      {!newsSource.isLive && (
        <div className="mt-6 rounded-lg border border-signal/40 bg-signal/[0.07] px-4 py-3">
          <p className="eyebrow text-signal">Sample feed</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
            These stories are written for teaching — realistic, but invented. They are not real
            reporting and the numbers in them are illustrative. The section is built against a
            swappable news source, so a live provider can be connected without changing anything
            you see here.
          </p>
        </div>
      )}

      <NewsFeed stories={stories} />
    </div>
  );
}
