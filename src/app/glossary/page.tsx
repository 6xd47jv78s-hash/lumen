import type { Metadata } from "next";
import { GlossaryBrowser } from "@/components/glossary/GlossaryBrowser";
import { GLOSSARY } from "@/content/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Every market term used on MarketLab, defined plainly — from order books and slippage to expectancy, drawdown and funding rates.",
};

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <header>
        <p className="eyebrow">Reference</p>
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight text-ink">Glossary</h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
          Every one of these {GLOSSARY.length} terms is linked from inside the lessons, so you never
          hit a word the course hasn&rsquo;t explained. Hover any dotted term while reading to see
          its definition without losing your place.
        </p>
      </header>

      <GlossaryBrowser />
    </div>
  );
}
