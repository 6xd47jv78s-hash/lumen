"use client";

import {
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type IPriceLine,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSeries, sma } from "@/lib/market/generate";
import type { Candle, ChartSpec, Series } from "@/lib/market/types";

export interface UserLevel {
  id: string;
  price: number;
  /** null = not yet graded. */
  correct?: boolean | null;
  label?: string;
}

export interface BarHighlight {
  index: number;
  kind: "correct" | "wrong" | "hint";
  text?: string;
}

export interface PriceChartProps {
  spec: ChartSpec;
  className?: string;
  /** Overlays defined in the spec are hidden until this is true. */
  showOverlays?: boolean;
  /** Student-drawn horizontal levels (support/resistance exercise). */
  userLevels?: UserLevel[];
  /** Markers for graded bar-picking exercises. */
  highlights?: BarHighlight[];
  onPriceClick?: (price: number) => void;
  onBarClick?: (index: number, candle: Candle) => void;
  /** Allow pan/zoom. Off for teaching charts so structure stays framed. */
  interactive?: boolean;
  /** Crosshair readout above the chart. */
  showLegend?: boolean;
}

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!v) return fallback;
  return `rgb(${v.split(/\s+/).join(",")})`;
}

function palette() {
  return {
    up: readVar("--c-up", "rgb(38,166,154)"),
    down: readVar("--c-down", "rgb(239,83,80)"),
    ink: readVar("--c-ink", "rgb(226,232,242)"),
    muted: readVar("--c-muted", "rgb(139,149,168)"),
    faint: readVar("--c-faint", "rgb(103,113,132)"),
    line: readVar("--c-line", "rgb(33,39,51)"),
    accent: readVar("--c-accent", "rgb(82,156,255)"),
    signal: readVar("--c-signal", "rgb(232,168,56)"),
    surface: readVar("--c-surface", "rgb(16,19,26)"),
  };
}

const MA_COLORS = ["#e8a838", "#7c8cf8", "#c084fc"];

const LEVEL_STYLE: Record<string, { key: "up" | "down" | "accent" | "signal"; dash: LineStyle }> = {
  support: { key: "up", dash: LineStyle.Solid },
  resistance: { key: "down", dash: LineStyle.Solid },
  neutral: { key: "accent", dash: LineStyle.Dashed },
  target: { key: "accent", dash: LineStyle.Dotted },
  stop: { key: "signal", dash: LineStyle.Dashed },
};

export function PriceChart({
  spec,
  className,
  showOverlays = true,
  userLevels,
  highlights,
  onPriceClick,
  onBarClick,
  interactive = false,
  showLegend = true,
}: PriceChartProps) {
  const holder = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineRef = useRef<ISeriesApi<"Line"> | null>(null);
  const priceLines = useRef<IPriceLine[]>([]);
  const [themeTick, setThemeTick] = useState(0);
  const [hover, setHover] = useState<Candle | null>(null);

  const series: Series = useMemo(
    () => getSeries(spec.scenario, spec.seed, spec.bars, spec.aggregate),
    [spec.scenario, spec.seed, spec.bars, spec.aggregate],
  );

  // Callbacks are read through refs so changing them doesn't rebuild the chart.
  const cbRef = useRef({ onPriceClick, onBarClick });
  cbRef.current = { onPriceClick, onBarClick };

  useEffect(() => {
    const onTheme = () => setThemeTick((t) => t + 1);
    window.addEventListener("marketlab:theme", onTheme);
    return () => window.removeEventListener("marketlab:theme", onTheme);
  }, []);

  /* ------------------------------------------------- build (theme-scoped) */
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const c = palette();

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: c.muted,
        fontFamily: "var(--font-sans)",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: c.line, style: LineStyle.Solid },
        horzLines: { color: c.line, style: LineStyle.Solid },
      },
      rightPriceScale: {
        borderColor: c.line,
        scaleMargins: { top: 0.12, bottom: spec.showVolume ? 0.26 : 0.1 },
      },
      timeScale: {
        borderColor: c.line,
        timeVisible: (spec.timeframe ?? "").includes("m") || (spec.timeframe ?? "").includes("h"),
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: c.faint, width: 1, style: LineStyle.Dashed, labelBackgroundColor: c.faint },
        horzLine: { color: c.faint, width: 1, style: LineStyle.Dashed, labelBackgroundColor: c.faint },
      },
      handleScroll: interactive,
      handleScale: interactive,
      autoSize: true,
    });
    chartRef.current = chart;

    if (spec.asLine) {
      const line = chart.addLineSeries({ color: c.accent, lineWidth: 2, priceLineVisible: false });
      line.setData(
        series.candles.map((k) => ({ time: k.time as UTCTimestamp, value: k.close })),
      );
      lineRef.current = line;
    } else {
      const candles = chart.addCandlestickSeries({
        upColor: c.up,
        downColor: c.down,
        wickUpColor: c.up,
        wickDownColor: c.down,
        borderVisible: false,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      candles.setData(series.candles.map((k) => ({ ...k, time: k.time as UTCTimestamp })));
      candleRef.current = candles;
    }

    if (spec.showVolume) {
      const vol = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "vol",
        priceLineVisible: false,
        lastValueVisible: false,
      });
      vol.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
      vol.setData(
        series.volumes.map((v) => ({
          time: v.time as UTCTimestamp,
          value: v.value,
          color: v.up ? `${c.up}66` : `${c.down}66`,
        })),
      );
    }

    (spec.ma ?? []).forEach((period, i) => {
      const s = chart.addLineSeries({
        color: MA_COLORS[i % MA_COLORS.length],
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      s.setData(sma(series.candles, period).map((p) => ({ ...p, time: p.time as UTCTimestamp })));
    });

    chart.timeScale().fitContent();

    const target = candleRef.current ?? lineRef.current;
    if (showLegend && target) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.time) return setHover(null);
        const idx = series.candles.findIndex((k) => k.time === param.time);
        setHover(idx >= 0 ? series.candles[idx] : null);
      });
    }

    if (onPriceClick || onBarClick) {
      chart.subscribeClick((param) => {
        const { onPriceClick: pc, onBarClick: bc } = cbRef.current;
        if (pc && param.point && target) {
          const price = target.coordinateToPrice(param.point.y);
          if (price != null) pc(Number(price));
        }
        if (bc && param.time != null) {
          const idx = series.candles.findIndex((k) => k.time === param.time);
          if (idx >= 0) bc(idx, series.candles[idx]);
        }
      });
    }

    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      lineRef.current = null;
      priceLines.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, spec, interactive, showLegend, themeTick]);

  /* ------------------------------------------------------------- overlays */
  useEffect(() => {
    const target = candleRef.current ?? lineRef.current;
    if (!target) return;
    const c = palette();
    const colorFor = (k: keyof ReturnType<typeof palette>) => c[k] as string;

    for (const pl of priceLines.current) {
      try {
        target.removePriceLine(pl);
      } catch {
        /* series already disposed */
      }
    }
    priceLines.current = [];

    if (showOverlays) {
      for (const lvl of spec.levels ?? []) {
        const price = series.anchors[lvl.anchor];
        if (price == null) continue;
        const style = LEVEL_STYLE[lvl.kind] ?? LEVEL_STYLE.neutral;
        priceLines.current.push(
          target.createPriceLine({
            price,
            color: colorFor(style.key),
            lineWidth: 2,
            lineStyle: lvl.style === "dashed" ? LineStyle.Dashed : style.dash,
            axisLabelVisible: true,
            title: lvl.label ?? "",
          }),
        );
      }
    }

    for (const lvl of userLevels ?? []) {
      const color =
        lvl.correct === true ? c.up : lvl.correct === false ? c.down : c.accent;
      priceLines.current.push(
        target.createPriceLine({
          price: lvl.price,
          color,
          lineWidth: 2,
          lineStyle: lvl.correct == null ? LineStyle.Dashed : LineStyle.Solid,
          axisLabelVisible: true,
          title: lvl.label ?? "",
        }),
      );
    }
  }, [spec.levels, userLevels, showOverlays, series, themeTick]);

  /* -------------------------------------------------------------- markers */
  useEffect(() => {
    const target = candleRef.current;
    if (!target) return;
    const c = palette();
    const markers: SeriesMarker<Time>[] = [];

    if (showOverlays) {
      for (const m of spec.markers ?? []) {
        const idx = series.anchors[m.anchor];
        if (idx == null || !series.candles[idx]) continue;
        const below = m.position === "below";
        markers.push({
          time: series.candles[Math.round(idx)].time as UTCTimestamp,
          position: below ? "belowBar" : "aboveBar",
          color:
            m.kind === "up" ? c.up : m.kind === "down" ? c.down : m.kind === "warn" ? c.signal : c.accent,
          shape: below ? "arrowUp" : "arrowDown",
          text: m.text,
        });
      }
    }

    for (const h of highlights ?? []) {
      const k = series.candles[h.index];
      if (!k) continue;
      markers.push({
        time: k.time as UTCTimestamp,
        position: "belowBar",
        color: h.kind === "correct" ? c.up : h.kind === "wrong" ? c.down : c.signal,
        shape: "arrowUp",
        text: h.text ?? (h.kind === "correct" ? "✓" : h.kind === "wrong" ? "✕" : ""),
      });
    }

    markers.sort((a, b) => (a.time as number) - (b.time as number));
    target.setMarkers(markers);
  }, [spec.markers, highlights, showOverlays, series, themeTick]);

  const last = series.candles[series.candles.length - 1];
  const shown = hover ?? last;
  const prevClose =
    series.candles[Math.max(0, series.candles.indexOf(shown) - 1)]?.close ?? shown.open;
  const delta = ((shown.close - prevClose) / prevClose) * 100;

  return (
    <div className={className}>
      {showLegend && (
        <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-2xs text-faint">
          <span className="text-xs font-semibold tracking-wide text-ink">
            {spec.symbol ?? "SYNTH"}
          </span>
          {spec.timeframe && <span className="text-muted">{spec.timeframe}</span>}
          <span className="tnum">
            O <span className="text-muted">{shown.open}</span>
          </span>
          <span className="tnum">
            H <span className="text-muted">{shown.high}</span>
          </span>
          <span className="tnum">
            L <span className="text-muted">{shown.low}</span>
          </span>
          <span className="tnum">
            C <span className="text-muted">{shown.close}</span>
          </span>
          <span className={`tnum ${delta >= 0 ? "text-up" : "text-down"}`}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(2)}%
          </span>
          {(spec.ma ?? []).map((p, i) => (
            <span key={p} style={{ color: MA_COLORS[i % MA_COLORS.length] }}>
              MA{p}
            </span>
          ))}
        </div>
      )}
      <div
        ref={holder}
        style={{ height: spec.height ?? 300 }}
        className={`w-full ${onPriceClick || onBarClick ? "cursor-crosshair" : ""}`}
      />
    </div>
  );
}
