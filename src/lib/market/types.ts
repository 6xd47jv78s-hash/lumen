export interface Candle {
  /** Unix seconds — lightweight-charts' business-day-free time format. */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeBar {
  time: number;
  value: number;
  up: boolean;
}

/** A generated series plus the structural facts a lesson wants to point at. */
export interface Series {
  candles: Candle[];
  volumes: VolumeBar[];
  /**
   * Named anchors produced by the scenario generator.
   *   `price.*`  — a price level (support, resistance, neckline, measured target)
   *   `bar.*`    — a bar index (the breakout bar, the fakeout wick, the swing high)
   * Lessons reference these by name so annotations survive a seed change.
   */
  anchors: Record<string, number>;
}

export type ScenarioId =
  | "uptrend"
  | "downtrend"
  | "range"
  | "breakout"
  | "fakeout"
  | "trend-change"
  | "double-top"
  | "double-bottom"
  | "bull-flag"
  | "support-flip"
  | "volume-divergence"
  | "stop-hunt"
  | "ma-crossover"
  | "mean-reversion"
  | "crypto-regimes"
  | "earnings-gap"
  | "news-spike"
  | "intraday-noise"
  | "choppy-range";

export interface LevelOverlay {
  /** Key into `Series.anchors`, e.g. "price.resistance". */
  anchor: string;
  label?: string;
  kind: "resistance" | "support" | "neutral" | "target" | "stop";
  style?: "solid" | "dashed" | "dotted";
}

export interface MarkerOverlay {
  /** Key into `Series.anchors`, e.g. "bar.breakout". */
  anchor: string;
  text: string;
  position?: "above" | "below";
  kind?: "up" | "down" | "neutral" | "warn";
}

export interface ChartSpec {
  scenario: ScenarioId;
  /** Deterministic — the same seed always renders the same chart. */
  seed: number;
  bars?: number;
  symbol?: string;
  timeframe?: string;
  height?: number;
  /** Aggregate generated bars N-to-1 before rendering (timeframe lessons). */
  aggregate?: number;
  levels?: LevelOverlay[];
  markers?: MarkerOverlay[];
  /** Simple moving average periods to overlay. */
  ma?: number[];
  showVolume?: boolean;
  /** Draw as a line series instead of candles — for "price is just a path" framing. */
  asLine?: boolean;
}
