"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface WeekPoint {
  label: string;
  /** Days studied in that week, 0-7. */
  days: number;
  /** Full range description, used in the tooltip and the table view. */
  range: string;
}

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `rgb(${v.split(/\s+/).join(",")})` : fallback;
}

/**
 * Study activity over the last twelve weeks. One series, so no legend — the
 * heading names it. Magnitude over time, so bars rather than a line: each week
 * is a discrete count, not a continuous quantity.
 */
export function ActivityChart({ data }: { data: WeekPoint[] }) {
  const [theme, setTheme] = useState(0);
  useEffect(() => {
    const h = () => setTheme((t) => t + 1);
    window.addEventListener("marketlab:theme", h);
    return () => window.removeEventListener("marketlab:theme", h);
  }, []);

  const accent = cssVar("--c-accent", "rgb(82,156,255)");
  const line = cssVar("--c-line", "rgb(33,39,51)");
  const faint = cssVar("--c-faint", "rgb(103,113,132)");
  const surface = cssVar("--c-raised", "rgb(23,27,36)");
  const ink = cssVar("--c-ink", "rgb(226,232,242)");

  const total = data.reduce((a, d) => a + d.days, 0);

  return (
    <div key={theme}>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={line} vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: line }}
              tick={{ fill: faint, fontSize: 10 }}
              interval={0}
            />
            <YAxis
              domain={[0, 7]}
              ticks={[0, 7]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: faint, fontSize: 10 }}
              width={22}
            />
            <Tooltip
              cursor={{ fill: line, opacity: 0.5 }}
              contentStyle={{
                background: surface,
                border: `1px solid ${line}`,
                borderRadius: 6,
                fontSize: 12,
                color: ink,
              }}
              labelStyle={{ color: faint, fontSize: 11 }}
              formatter={(v: number) => [`${v} ${v === 1 ? "day" : "days"}`, "Studied"]}
              labelFormatter={(_, p) => p?.[0]?.payload?.range ?? ""}
            />
            <Bar dataKey="days" fill={accent} radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Text equivalent — the chart is never the only way to read this. */}
      <p className="mt-2 text-xs text-faint">
        {total === 0
          ? "No study days recorded yet."
          : `${total} study ${total === 1 ? "day" : "days"} across the last 12 weeks.`}
      </p>
    </div>
  );
}
