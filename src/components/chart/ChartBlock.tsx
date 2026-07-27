"use client";

import dynamic from "next/dynamic";
import type { ChartSpec } from "@/lib/market/types";
import type { PriceChartProps } from "./PriceChart";

/** lightweight-charts touches `document` on import, so it never renders on the server. */
const PriceChart = dynamic<PriceChartProps>(
  () => import("./PriceChart").then((m) => m.PriceChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] w-full items-center justify-center rounded border border-line bg-raised/40">
        <span className="eyebrow animate-pulse">Loading chart…</span>
      </div>
    ),
  },
);

export function ChartBlock({ spec, children }: { spec: ChartSpec; children?: React.ReactNode }) {
  return (
    <figure className="my-7 overflow-hidden rounded-lg border border-line bg-surface">
      <div className="px-3 pt-3">
        <PriceChart spec={spec} />
      </div>
      {children && (
        <figcaption className="border-t border-line bg-raised/45 px-4 py-2.5 text-sm leading-relaxed text-muted">
          {children}
        </figcaption>
      )}
    </figure>
  );
}

export { PriceChart };
export type { BarHighlight, UserLevel } from "./PriceChart";
