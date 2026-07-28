import type { Candle, ScenarioId, Series, VolumeBar } from "./types";

/**
 * Deterministic OHLC generation for teaching charts.
 *
 * Design note: these series are built from control points plus mean-reverting
 * noise rather than from a pure random walk. A pure walk produces *realistic*
 * charts but not *legible* ones — the structure a lesson is trying to point at
 * (a clean higher low, a neckline, a failed breakout) shows up only by luck.
 * Control points guarantee the structure exists; the noise layer keeps the bars
 * from looking drawn by hand. Every scenario also publishes the exact prices and
 * bar indices of its structure as `anchors`, so annotations never drift.
 *
 * Live-data integration point: swap `getSeries()` for a fetch against a real
 * OHLC endpoint and keep the same `Series` shape. Everything downstream —
 * charts, overlays, exercises — is written against `Series`, not the generator.
 */

/* ------------------------------------------------------------------ RNG --- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function gauss(rng: Rng): number {
  // Box–Muller, clamped so a freak tail can't blow out a teaching chart.
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  const g = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return Math.max(-2.6, Math.min(2.6, g));
}

/* ---------------------------------------------------------------- paths --- */

interface Point {
  /** Fractional position through the series, 0..1. */
  at: number;
  /** Price at that point, as a multiple of the starting price. */
  p: number;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

/** Interpolate control points into a per-bar target path. */
function buildPath(points: Point[], bars: number, ease = true): number[] {
  const out: number[] = [];
  for (let i = 0; i < bars; i++) {
    const at = bars === 1 ? 0 : i / (bars - 1);
    let a = points[0];
    let b = points[points.length - 1];
    for (let k = 0; k < points.length - 1; k++) {
      if (at >= points[k].at && at <= points[k + 1].at) {
        a = points[k];
        b = points[k + 1];
        break;
      }
    }
    const span = b.at - a.at || 1;
    const t = Math.min(1, Math.max(0, (at - a.at) / span));
    const w = ease ? smoothstep(t) : t;
    out.push(a.p + (b.p - a.p) * w);
  }
  return out;
}

interface BuildOpts {
  bars: number;
  start: number;
  /** Noise as a fraction of price. */
  noise: number;
  /** Intrabar range as a fraction of price. */
  wick?: number;
  /** Per-bar noise multipliers, for volatility regimes. */
  volProfile?: (i: number, bars: number) => number;
  startTime?: number;
  /** Seconds per bar. Default 1 day. */
  interval?: number;
}

const DAY = 86400;
/** 2024-01-02, a Tuesday — keeps generated daily series on plausible dates. */
const EPOCH = 1704153600;

/**
 * Turn a target path into candles. Noise is mean-reverting (an AR(1) process)
 * so price wanders around the path instead of drifting off it, which is what
 * keeps structure like a horizontal range actually horizontal.
 */
function toCandles(rng: Rng, path: number[], opts: BuildOpts): Candle[] {
  const { bars, start, noise, wick = 0.55, volProfile, interval = DAY } = opts;
  const t0 = opts.startTime ?? EPOCH;
  const candles: Candle[] = [];
  let dev = 0;
  let prevClose = start * path[0];

  for (let i = 0; i < bars; i++) {
    const vol = volProfile ? volProfile(i, bars) : 1;
    const amp = noise * vol;
    dev = dev * 0.62 + gauss(rng) * amp;
    const target = start * path[i];
    const close = target * (1 + dev);

    // Open near the previous close, with an occasional small gap.
    const gap = gauss(rng) * amp * 0.28;
    const open = i === 0 ? close * (1 - dev * 0.5) : prevClose * (1 + gap);

    const body = Math.abs(close - open);
    const reach = Math.max(body * 0.85, close * amp * wick);
    const high = Math.max(open, close) + reach * (0.25 + rng() * 0.9);
    const low = Math.min(open, close) - reach * (0.25 + rng() * 0.9);

    candles.push({
      time: t0 + i * interval,
      open: r(open),
      high: r(high),
      low: r(low),
      close: r(close),
    });
    prevClose = close;
  }
  return candles;
}

function r(n: number): number {
  const abs = Math.abs(n);
  const dp = abs >= 1000 ? 1 : abs >= 100 ? 2 : abs >= 1 ? 2 : 4;
  return Number(n.toFixed(dp));
}

/** Volume derived from bar range and direction, plus optional event spikes. */
function makeVolumes(
  rng: Rng,
  candles: Candle[],
  spikes: Record<number, number> = {},
  baseTrend: (i: number, n: number) => number = () => 1,
): VolumeBar[] {
  const ranges = candles.map((c) => c.high - c.low);
  const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length || 1;
  return candles.map((c, i) => {
    const rel = ranges[i] / avgRange;
    const base = 1_000_000 * baseTrend(i, candles.length);
    const v = base * (0.55 + rel * 0.7) * (0.82 + rng() * 0.42) * (spikes[i] ?? 1);
    return { time: c.time, value: Math.round(v), up: c.close >= c.open };
  });
}

/**
 * Force a bar's extreme to touch a level precisely — this is what makes an S/R
 * test land exactly on the line a lesson then annotates.
 *
 * If the body sits beyond the level it gets shifted back inside, which can move
 * it past the *other* extreme, so both wicks are re-derived afterwards. Skipping
 * that produces candles whose body escapes its own wick: subtle enough to miss
 * by eye, and wrong.
 */
function touch(c: Candle, level: number, side: "high" | "low", slip = 0) {
  if (side === "high") {
    const target = level + slip;
    const bodyTop = Math.max(c.open, c.close);
    if (bodyTop > target) {
      const shift = target - bodyTop;
      c.open += shift;
      c.close += shift;
    }
    c.high = target;
  } else {
    const target = level - slip;
    const bodyBottom = Math.min(c.open, c.close);
    if (bodyBottom < target) {
      const shift = target - bodyBottom;
      c.open += shift;
      c.close += shift;
    }
    c.low = target;
  }

  c.open = r(c.open);
  c.close = r(c.close);
  c.high = r(Math.max(c.high, c.open, c.close));
  c.low = r(Math.min(c.low, c.open, c.close));
}

function priceAt(candles: Candle[], i: number) {
  return candles[Math.max(0, Math.min(candles.length - 1, i))].close;
}

/* ------------------------------------------------------------ scenarios --- */

interface ScenarioCtx {
  rng: Rng;
  bars: number;
  start: number;
}

type ScenarioFn = (ctx: ScenarioCtx) => Series;

const scenarios: Record<ScenarioId, ScenarioFn> = {
  /** Textbook higher highs / higher lows, with legible swings. */
  uptrend: ({ rng, bars, start }) => {
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.14, p: 1.09 },
        { at: 0.24, p: 1.04 },
        { at: 0.42, p: 1.19 },
        { at: 0.53, p: 1.13 },
        { at: 0.74, p: 1.31 },
        { at: 0.84, p: 1.25 },
        { at: 1, p: 1.4 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.011 });
    const swings = {
      "bar.high1": Math.round(bars * 0.14),
      "bar.low1": Math.round(bars * 0.24),
      "bar.high2": Math.round(bars * 0.42),
      "bar.low2": Math.round(bars * 0.53),
      "bar.high3": Math.round(bars * 0.74),
      "bar.low3": Math.round(bars * 0.84),
    };
    return {
      candles,
      volumes: makeVolumes(rng, candles),
      anchors: {
        ...swings,
        "price.high1": Math.max(...candles.slice(swings["bar.high1"] - 2, swings["bar.high1"] + 3).map((c) => c.high)),
        "price.low1": Math.min(...candles.slice(swings["bar.low1"] - 2, swings["bar.low1"] + 3).map((c) => c.low)),
        "price.low2": Math.min(...candles.slice(swings["bar.low2"] - 2, swings["bar.low2"] + 3).map((c) => c.low)),
      },
    };
  },

  /** Lower highs / lower lows — the mirror image, including the bounce traps. */
  downtrend: ({ rng, bars, start }) => {
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.16, p: 0.92 },
        { at: 0.27, p: 0.965 },
        { at: 0.45, p: 0.86 },
        { at: 0.56, p: 0.9 },
        { at: 0.76, p: 0.79 },
        { at: 0.86, p: 0.83 },
        { at: 1, p: 0.73 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.012 });
    return {
      candles,
      volumes: makeVolumes(rng, candles),
      anchors: {
        "bar.high1": Math.round(bars * 0.27),
        "bar.high2": Math.round(bars * 0.56),
        "bar.high3": Math.round(bars * 0.86),
        "price.high1": Math.max(...candles.slice(Math.round(bars * 0.24), Math.round(bars * 0.3)).map((c) => c.high)),
      },
    };
  },

  /** A clean horizontal range: repeated tests of the same two levels. */
  range: ({ rng, bars, start }) => {
    const sup = start * 0.955;
    const res = start * 1.045;
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.1, p: 1.042 },
        { at: 0.24, p: 0.958 },
        { at: 0.38, p: 1.04 },
        { at: 0.52, p: 0.957 },
        { at: 0.68, p: 1.043 },
        { at: 0.82, p: 0.959 },
        { at: 1, p: 1.02 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.007 });
    const hits = [0.1, 0.38, 0.68].map((f) => Math.round(bars * f));
    const lows = [0.24, 0.52, 0.82].map((f) => Math.round(bars * f));
    hits.forEach((i, k) => touch(candles[i], res, "high", start * (0.001 * k)));
    lows.forEach((i, k) => touch(candles[i], sup, "low", start * (0.001 * k)));
    return {
      candles,
      volumes: makeVolumes(rng, candles, {}, (i, n) => 1 - (i / n) * 0.35),
      anchors: {
        "price.resistance": r(res),
        "price.support": r(sup),
        "price.mid": r((res + sup) / 2),
        "bar.res1": hits[0],
        "bar.res2": hits[1],
        "bar.res3": hits[2],
        "bar.sup1": lows[0],
        "bar.sup2": lows[1],
        "bar.sup3": lows[2],
      },
    };
  },

  /** Range, then a real break: expansion bar, volume spike, no return. */
  breakout: ({ rng, bars, start }) => {
    const res = start * 1.04;
    const sup = start * 0.96;
    const brk = Math.round(bars * 0.66);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.12, p: 1.035 },
        { at: 0.26, p: 0.963 },
        { at: 0.4, p: 1.036 },
        { at: 0.54, p: 0.968 },
        { at: 0.62, p: 1.03 },
        { at: 0.7, p: 1.075 },
        { at: 0.82, p: 1.06 },
        { at: 1, p: 1.14 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, {
      bars,
      start,
      noise: 0.0075,
      volProfile: (i) => (i >= brk - 1 ? 1.8 : 0.9),
    });
    [0.12, 0.4].forEach((f) => touch(candles[Math.round(bars * f)], res, "high"));
    [0.26, 0.54].forEach((f) => touch(candles[Math.round(bars * f)], sup, "low"));
    // Retest of broken resistance as support.
    const retest = Math.round(bars * 0.82);
    touch(candles[retest], res * 1.004, "low");
    return {
      candles,
      volumes: makeVolumes(rng, candles, { [brk]: 3.1, [brk + 1]: 2.2 }, (i, n) =>
        i < brk ? 1 - (i / n) * 0.3 : 1.1,
      ),
      anchors: {
        "price.resistance": r(res),
        "price.support": r(sup),
        "bar.breakout": brk,
        "bar.retest": retest,
        "price.target": r(res + (res - sup)),
      },
    };
  },

  /** The break that fails — the single most expensive chart pattern to misread. */
  fakeout: ({ rng, bars, start }) => {
    const res = start * 1.038;
    const sup = start * 0.962;
    const brk = Math.round(bars * 0.6);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.13, p: 1.033 },
        { at: 0.28, p: 0.966 },
        { at: 0.44, p: 1.034 },
        { at: 0.55, p: 0.985 },
        { at: 0.6, p: 1.052 },
        { at: 0.68, p: 1.0 },
        { at: 0.84, p: 0.968 },
        { at: 1, p: 0.93 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, {
      bars,
      start,
      // Tighter than the other range scenarios: the point of this chart is that
      // the ceiling reads as a ceiling, so the trap bar is unmistakable.
      noise: 0.0055,
      volProfile: (i) => (i >= brk && i <= brk + 2 ? 1.5 : 0.95),
    });
    [0.13, 0.44].forEach((f) => touch(candles[Math.round(bars * f)], res, "high"));
    [0.28].forEach((f) => touch(candles[Math.round(bars * f)], sup, "low"));
    // The trap bar: pokes above resistance, closes back inside the range.
    const trap = candles[brk];
    trap.high = r(res * 1.017);
    trap.close = r(res * 0.995);
    trap.open = r(res * 1.006);
    trap.low = r(Math.min(trap.low, trap.close));
    return {
      candles,
      // Note the volume: the break bar is only mildly above average. Real
      // breakouts usually arrive with conviction; this one didn't.
      volumes: makeVolumes(rng, candles, { [brk]: 1.35, [brk + 3]: 2.4 }),
      anchors: {
        "price.resistance": r(res),
        "price.support": r(sup),
        "bar.trap": brk,
        "bar.confirm": brk + 3,
      },
    };
  },

  /** An uptrend that stops making higher highs, then breaks its last higher low. */
  "trend-change": ({ rng, bars, start }) => {
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.15, p: 1.11 },
        { at: 0.26, p: 1.06 },
        { at: 0.42, p: 1.2 },
        { at: 0.54, p: 1.13 },
        { at: 0.66, p: 1.185 },
        { at: 0.78, p: 1.105 },
        { at: 0.88, p: 1.14 },
        { at: 1, p: 1.05 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.011 });
    const lowerHigh = Math.round(bars * 0.66);
    const brokenLow = Math.round(bars * 0.78);
    return {
      candles,
      volumes: makeVolumes(rng, candles, { [brokenLow]: 1.9 }),
      anchors: {
        "bar.hh": Math.round(bars * 0.42),
        "bar.lh": lowerHigh,
        "bar.break": brokenLow,
        "price.pivotHigh": Math.max(
          ...candles.slice(Math.round(bars * 0.39), Math.round(bars * 0.46)).map((c) => c.high),
        ),
        "price.pivotLow": Math.min(
          ...candles.slice(Math.round(bars * 0.51), Math.round(bars * 0.58)).map((c) => c.low),
        ),
      },
    };
  },

  /** Two failed pushes at the same ceiling, then the neckline goes. */
  "double-top": ({ rng, bars, start }) => {
    const peak = start * 1.13;
    const neck = start * 1.02;
    const p1 = Math.round(bars * 0.34);
    const p2 = Math.round(bars * 0.62);
    const brk = Math.round(bars * 0.78);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.34, p: 1.13 },
        { at: 0.48, p: 1.025 },
        { at: 0.62, p: 1.128 },
        { at: 0.78, p: 1.015 },
        { at: 0.88, p: 0.985 },
        { at: 1, p: 0.925 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.009 });
    touch(candles[p1], peak, "high");
    touch(candles[p2], peak * 0.999, "high");
    touch(candles[Math.round(bars * 0.48)], neck, "low");
    return {
      candles,
      // Second peak on lighter volume — the tell that buyers were thinning out.
      volumes: makeVolumes(rng, candles, { [p1]: 1.6, [p2]: 0.85, [brk]: 2.4 }),
      anchors: {
        "price.peak": r(peak),
        "price.neckline": r(neck),
        "bar.peak1": p1,
        "bar.peak2": p2,
        "bar.break": brk,
        "price.target": r(neck - (peak - neck)),
      },
    };
  },

  "double-bottom": ({ rng, bars, start }) => {
    const trough = start * 0.88;
    const neck = start * 0.985;
    const b1 = Math.round(bars * 0.32);
    const b2 = Math.round(bars * 0.6);
    const brk = Math.round(bars * 0.76);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.32, p: 0.88 },
        { at: 0.46, p: 0.98 },
        { at: 0.6, p: 0.884 },
        { at: 0.76, p: 0.995 },
        { at: 0.88, p: 1.03 },
        { at: 1, p: 1.085 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.009 });
    touch(candles[b1], trough, "low");
    touch(candles[b2], trough * 1.002, "low");
    touch(candles[Math.round(bars * 0.46)], neck, "high");
    return {
      candles,
      volumes: makeVolumes(rng, candles, { [b1]: 1.7, [b2]: 0.9, [brk]: 2.6 }),
      anchors: {
        "price.trough": r(trough),
        "price.neckline": r(neck),
        "bar.bottom1": b1,
        "bar.bottom2": b2,
        "bar.break": brk,
        "price.target": r(neck + (neck - trough)),
      },
    };
  },

  /** Sharp advance, tight drifting-down consolidation, continuation. */
  "bull-flag": ({ rng, bars, start }) => {
    const poleTop = Math.round(bars * 0.34);
    const flagEnd = Math.round(bars * 0.66);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.08, p: 1.01 },
        { at: 0.34, p: 1.22 },
        { at: 0.66, p: 1.16 },
        { at: 0.76, p: 1.24 },
        { at: 1, p: 1.42 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, {
      bars,
      start,
      noise: 0.009,
      // The flag is quiet by definition — volatility contracts inside it.
      volProfile: (i) => (i > poleTop && i < flagEnd ? 0.42 : 1.15),
    });
    return {
      candles,
      volumes: makeVolumes(rng, candles, { [flagEnd + 1]: 2.5 }, (i) =>
        i > poleTop && i < flagEnd ? 0.5 : i < poleTop ? 1.5 : 1.2,
      ),
      anchors: {
        "bar.poleStart": Math.round(bars * 0.08),
        "bar.poleTop": poleTop,
        "bar.flagEnd": flagEnd,
        "price.poleTop": Math.max(...candles.slice(poleTop - 2, poleTop + 3).map((c) => c.high)),
        "price.flagLow": Math.min(...candles.slice(poleTop, flagEnd + 1).map((c) => c.low)),
        "price.target": r(
          Math.max(...candles.slice(poleTop - 2, poleTop + 3).map((c) => c.high)) + start * 0.22,
        ),
      },
    };
  },

  /** Resistance breaks, then holds as support on the retest — polarity flip. */
  "support-flip": ({ rng, bars, start }) => {
    const level = start * 1.05;
    const brk = Math.round(bars * 0.42);
    const retest = Math.round(bars * 0.62);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.12, p: 1.045 },
        { at: 0.26, p: 0.985 },
        { at: 0.42, p: 1.09 },
        { at: 0.62, p: 1.055 },
        { at: 0.8, p: 1.13 },
        { at: 1, p: 1.18 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.008 });
    touch(candles[Math.round(bars * 0.12)], level, "high");
    touch(candles[retest], level * 1.002, "low");
    return {
      candles,
      volumes: makeVolumes(rng, candles, { [brk]: 2.3 }),
      anchors: {
        "price.level": r(level),
        "bar.reject": Math.round(bars * 0.12),
        "bar.break": brk,
        "bar.retest": retest,
      },
    };
  },

  /** Price grinds to new highs while participation drains away. */
  "volume-divergence": ({ rng, bars, start }) => {
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.2, p: 1.08 },
        { at: 0.32, p: 1.05 },
        { at: 0.55, p: 1.13 },
        { at: 0.66, p: 1.1 },
        { at: 0.85, p: 1.16 },
        { at: 1, p: 1.14 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, {
      bars,
      start,
      noise: 0.009,
      // Ranges compress as the move ages — the visual half of the divergence.
      volProfile: (i, n) => 1.25 - (i / n) * 0.6,
    });
    return {
      candles,
      volumes: makeVolumes(rng, candles, {}, (i, n) => 1.6 - (i / n) * 1.05),
      anchors: {
        "bar.push1": Math.round(bars * 0.2),
        "bar.push2": Math.round(bars * 0.55),
        "bar.push3": Math.round(bars * 0.85),
      },
    };
  },

  /** A long wick through support that reverses instantly — the stop sweep. */
  "stop-hunt": ({ rng, bars, start }) => {
    const sup = start * 0.97;
    const hunt = Math.round(bars * 0.58);
    const path = buildPath(
      [
        { at: 0, p: 1.01 },
        { at: 0.16, p: 0.975 },
        { at: 0.32, p: 1.015 },
        { at: 0.46, p: 0.973 },
        { at: 0.58, p: 0.985 },
        { at: 0.74, p: 1.03 },
        { at: 1, p: 1.075 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.007 });
    [0.16, 0.46].forEach((f) => touch(candles[Math.round(bars * f)], sup, "low"));
    const bar = candles[hunt];
    bar.low = r(sup * 0.978);
    bar.open = r(sup * 1.004);
    bar.close = r(sup * 1.012);
    bar.high = r(sup * 1.016);
    return {
      candles,
      volumes: makeVolumes(rng, candles, { [hunt]: 2.8 }),
      anchors: { "price.support": r(sup), "bar.hunt": hunt, "price.wick": r(sup * 0.978) },
    };
  },

  /** Slow decline, cross up, sustained advance — and the whipsaw in the middle. */
  "ma-crossover": ({ rng, bars, start }) => {
    const path = buildPath(
      [
        { at: 0, p: 1.06 },
        { at: 0.2, p: 0.95 },
        { at: 0.32, p: 1.0 },
        { at: 0.44, p: 0.94 },
        { at: 0.6, p: 1.03 },
        { at: 0.78, p: 1.14 },
        { at: 1, p: 1.24 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.011 });
    return {
      candles,
      volumes: makeVolumes(rng, candles),
      anchors: { "bar.whipsaw": Math.round(bars * 0.34), "bar.cross": Math.round(bars * 0.58) },
    };
  },

  /** Oscillation around a stable mean — where mean reversion actually works. */
  "mean-reversion": ({ rng, bars, start }) => {
    const path: number[] = [];
    for (let i = 0; i < bars; i++) {
      path.push(1 + Math.sin(i / 6.2) * 0.035 + Math.sin(i / 15.5) * 0.018);
    }
    const candles = toCandles(rng, path, { bars, start, noise: 0.006 });
    return {
      candles,
      volumes: makeVolumes(rng, candles),
      anchors: { "price.mean": r(start), "price.upper": r(start * 1.05), "price.lower": r(start * 0.95) },
    };
  },

  /** Crypto's signature shape: dead quiet, then a regime change. */
  "crypto-regimes": ({ rng, bars, start }) => {
    const shift = Math.round(bars * 0.5);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.2, p: 1.01 },
        { at: 0.42, p: 0.99 },
        { at: 0.5, p: 1.02 },
        { at: 0.62, p: 1.34 },
        { at: 0.72, p: 1.18 },
        { at: 0.84, p: 1.52 },
        { at: 1, p: 1.28 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, {
      bars,
      start,
      noise: 0.012,
      wick: 0.9,
      volProfile: (i) => (i < shift ? 0.28 : 2.4),
    });
    return {
      candles,
      volumes: makeVolumes(rng, candles, {}, (i) => (i < shift ? 0.4 : 2.0)),
      anchors: { "bar.regimeShift": shift },
    };
  },

  /** The overnight earnings gap — no trading between the two prices. */
  "earnings-gap": ({ rng, bars, start }) => {
    const g = Math.round(bars * 0.55);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.25, p: 1.03 },
        { at: 0.5, p: 1.06 },
        { at: 0.56, p: 0.94 },
        { at: 0.7, p: 0.93 },
        { at: 1, p: 0.9 },
      ],
      bars,
    );
    const candles = toCandles(rng, path, { bars, start, noise: 0.006 });
    const prev = candles[g - 1];
    const bar = candles[g];
    bar.open = r(prev.close * 0.935);
    bar.high = r(bar.open * 1.008);
    bar.close = r(bar.open * 0.985);
    bar.low = r(bar.close * 0.99);
    return {
      candles,
      volumes: makeVolumes(rng, candles, { [g]: 4.2, [g + 1]: 2.1 }),
      anchors: {
        "bar.gap": g,
        "price.preGap": r(prev.close),
        "price.postGap": r(bar.open),
      },
    };
  },

  /** Headline hits: vertical spike, then most of it gets given back. */
  "news-spike": ({ rng, bars, start }) => {
    const s = Math.round(bars * 0.45);
    const path = buildPath(
      [
        { at: 0, p: 1 },
        { at: 0.42, p: 1.005 },
        { at: 0.47, p: 1.055 },
        { at: 0.56, p: 1.02 },
        { at: 0.7, p: 1.03 },
        { at: 1, p: 1.015 },
      ],
      bars,
      false,
    );
    const candles = toCandles(rng, path, {
      bars,
      start,
      noise: 0.004,
      interval: 300,
      volProfile: (i) => (Math.abs(i - s) < 3 ? 3.2 : 0.8),
    });
    return {
      candles,
      volumes: makeVolumes(rng, candles, { [s]: 5.5, [s + 1]: 3.0 }),
      anchors: { "bar.spike": s, "price.spikeHigh": Math.max(...candles.map((c) => c.high)) },
    };
  },

  /** Five-minute chop: the same asset that looks like a clean trend on a daily. */
  "intraday-noise": ({ rng, bars, start }) => {
    const path: number[] = [];
    for (let i = 0; i < bars; i++) {
      path.push(1 + (i / bars) * 0.012 + Math.sin(i / 4.1) * 0.004 + Math.sin(i / 11) * 0.003);
    }
    const candles = toCandles(rng, path, { bars, start, noise: 0.0022, interval: 300 });
    return { candles, volumes: makeVolumes(rng, candles), anchors: {} };
  },

  /** Directionless, overlapping bars — the market most strategies lose money in. */
  "choppy-range": ({ rng, bars, start }) => {
    const path: number[] = [];
    for (let i = 0; i < bars; i++) {
      path.push(1 + Math.sin(i / 3.3) * 0.012 + Math.sin(i / 7.7) * 0.016 + Math.sin(i / 19) * 0.008);
    }
    const candles = toCandles(rng, path, { bars, start, noise: 0.009, wick: 1.1 });
    return {
      candles,
      volumes: makeVolumes(rng, candles),
      anchors: { "price.upper": r(start * 1.03), "price.lower": r(start * 0.97) },
    };
  },
};

/* --------------------------------------------------------------- public --- */

const DEFAULT_BARS: Partial<Record<ScenarioId, number>> = {
  "news-spike": 78,
  "intraday-noise": 90,
  "crypto-regimes": 110,
  "mean-reversion": 100,
  "choppy-range": 100,
};

const DEFAULT_START: Partial<Record<ScenarioId, number>> = {
  "crypto-regimes": 41200,
  "news-spike": 5480,
  "intraday-noise": 187.4,
};

/** Aggregate N bars into one — how a 5-minute chart becomes an hourly chart. */
export function aggregate(series: Series, factor: number): Series {
  if (factor <= 1) return series;
  const candles: Candle[] = [];
  const volumes: VolumeBar[] = [];
  for (let i = 0; i < series.candles.length; i += factor) {
    const group = series.candles.slice(i, i + factor);
    if (!group.length) break;
    const vg = series.volumes.slice(i, i + factor);
    const c: Candle = {
      time: group[0].time,
      open: group[0].open,
      high: Math.max(...group.map((g) => g.high)),
      low: Math.min(...group.map((g) => g.low)),
      close: group[group.length - 1].close,
    };
    candles.push(c);
    volumes.push({
      time: c.time,
      value: vg.reduce((a, b) => a + b.value, 0),
      up: c.close >= c.open,
    });
  }
  return { candles, volumes, anchors: series.anchors };
}

const cache = new Map<string, Series>();

export function getSeries(
  scenario: ScenarioId,
  seed: number,
  bars?: number,
  aggregateBy?: number,
): Series {
  const n = bars ?? DEFAULT_BARS[scenario] ?? 120;
  const key = `${scenario}:${seed}:${n}:${aggregateBy ?? 1}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const rng = mulberry32(seed * 2654435761 + n);
  const start = DEFAULT_START[scenario] ?? 100 + Math.round(mulberry32(seed)() * 180);
  let series = scenarios[scenario]({ rng, bars: n, start });
  if (aggregateBy && aggregateBy > 1) series = aggregate(series, aggregateBy);
  cache.set(key, series);
  return series;
}

/** Simple moving average, aligned to the candle array (leading nulls dropped). */
export function sma(candles: Candle[], period: number): { time: number; value: number }[] {
  const out: { time: number; value: number }[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) out.push({ time: candles[i].time, value: r(sum / period) });
  }
  return out;
}

export const SCENARIO_IDS = Object.keys(scenarios) as ScenarioId[];
