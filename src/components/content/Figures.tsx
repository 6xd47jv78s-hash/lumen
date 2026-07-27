/**
 * Hand-built diagrams for concepts a price chart can't show clearly.
 * A generated chart is the right tool for structure; these are the right tool
 * for anatomy.
 */

export type FigureId = "candle-anatomy" | "candle-shapes" | "timeframe-nesting" | "rr-grid";

export function Figure({ id }: { id: FigureId }) {
  switch (id) {
    case "candle-anatomy":
      return <CandleAnatomy />;
    case "candle-shapes":
      return <CandleShapes />;
    case "timeframe-nesting":
      return <TimeframeNesting />;
    case "rr-grid":
      return <RiskRewardGrid />;
  }
}

/* ------------------------------------------------------------------------ */

function CandleAnatomy() {
  return (
    <svg viewBox="0 0 420 250" className="mx-auto w-full max-w-md" role="img" aria-label="Anatomy of a bullish and a bearish candlestick">
      <g className="fill-none stroke-line" strokeDasharray="3 4" strokeWidth="1">
        <line x1="40" y1="35" x2="380" y2="35" />
        <line x1="40" y1="80" x2="380" y2="80" />
        <line x1="40" y1="170" x2="380" y2="170" />
        <line x1="40" y1="215" x2="380" y2="215" />
      </g>

      {/* bullish */}
      <g>
        <line x1="140" y1="35" x2="140" y2="215" className="stroke-up" strokeWidth="2" />
        <rect x="122" y="80" width="36" height="90" className="fill-up" rx="2" />
      </g>
      {/* bearish */}
      <g>
        <line x1="280" y1="35" x2="280" y2="215" className="stroke-down" strokeWidth="2" />
        <rect x="262" y="80" width="36" height="90" className="fill-down" rx="2" />
      </g>

      <g className="fill-current text-faint font-mono" fontSize="10">
        <text x="34" y="38" textAnchor="end">HIGH</text>
        <text x="34" y="83" textAnchor="end">CLOSE</text>
        <text x="34" y="173" textAnchor="end">OPEN</text>
        <text x="34" y="218" textAnchor="end">LOW</text>
        <text x="386" y="83">OPEN</text>
        <text x="386" y="173">CLOSE</text>
      </g>

      <g className="fill-current text-muted" fontSize="11">
        <text x="140" y="240" textAnchor="middle">closed up</text>
        <text x="280" y="240" textAnchor="middle">closed down</text>
      </g>

      <g className="fill-current text-faint font-mono" fontSize="9.5">
        <text x="176" y="60">upper wick</text>
        <text x="176" y="130">body</text>
        <text x="176" y="200">lower wick</text>
      </g>
      <g className="stroke-line-strong" strokeWidth="1">
        <line x1="164" y1="57" x2="150" y2="57" />
        <line x1="164" y1="127" x2="150" y2="127" />
        <line x1="164" y1="197" x2="150" y2="197" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */

interface Shape {
  name: string;
  meaning: string;
  /** All values 0-100, measured from the top of the drawing box. */
  high: number;
  low: number;
  bodyTop: number;
  bodyBottom: number;
  up: boolean;
}

const SHAPES: Shape[] = [
  { name: "Marubozu", meaning: "One side controlled the whole period", high: 8, low: 92, bodyTop: 10, bodyBottom: 90, up: true },
  { name: "Doji", meaning: "Open ≈ close: genuine indecision", high: 10, low: 90, bodyTop: 49, bodyBottom: 51, up: true },
  { name: "Hammer", meaning: "Sellers pushed down, buyers rejected it", high: 22, low: 92, bodyTop: 24, bodyBottom: 38, up: true },
  { name: "Shooting star", meaning: "Buyers pushed up, sellers rejected it", high: 8, low: 78, bodyTop: 62, bodyBottom: 76, up: false },
  { name: "Spinning top", meaning: "Wide range, tiny result — a fight, no winner", high: 12, low: 88, bodyTop: 44, bodyBottom: 58, up: false },
];

function CandleShapes() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {SHAPES.map((s) => (
        <div key={s.name} className="rounded-md border border-line bg-raised/50 p-3 text-center">
          <svg viewBox="0 0 40 100" className="mx-auto h-24" role="img" aria-label={s.name}>
            <line
              x1="20"
              y1={s.high}
              x2="20"
              y2={s.low}
              className={s.up ? "stroke-up" : "stroke-down"}
              strokeWidth="2"
            />
            <rect
              x="9"
              y={s.bodyTop}
              width="22"
              height={Math.max(2, s.bodyBottom - s.bodyTop)}
              className={s.up ? "fill-up" : "fill-down"}
              rx="1.5"
            />
          </svg>
          <p className="mt-2 text-xs font-semibold text-ink">{s.name}</p>
          <p className="mt-1 text-2xs leading-snug text-faint">{s.meaning}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function TimeframeNesting() {
  return (
    <svg viewBox="0 0 420 170" className="mx-auto w-full max-w-lg" role="img" aria-label="Twelve hourly candles combining into two four-hour candles and one daily candle">
      <g className="fill-current text-faint font-mono" fontSize="9.5">
        <text x="4" y="26">1H</text>
        <text x="4" y="86">4H</text>
        <text x="4" y="146">1D</text>
      </g>

      {/* 1H row */}
      {Array.from({ length: 12 }).map((_, i) => {
        const up = [true, true, false, true, false, false, true, true, true, false, true, true][i];
        const h = [14, 10, 16, 9, 18, 12, 11, 8, 15, 13, 9, 12][i];
        const y = [8, 12, 6, 14, 4, 10, 16, 20, 12, 8, 18, 14][i];
        return (
          <rect
            key={i}
            x={34 + i * 30}
            y={y}
            width="10"
            height={h}
            rx="1"
            className={up ? "fill-up" : "fill-down"}
          />
        );
      })}

      {/* brackets */}
      <g className="stroke-line-strong" strokeWidth="1" fill="none">
        <path d="M34 42 v6 h170 v-6" />
        <path d="M214 42 v6 h170 v-6" />
        <path d="M34 102 v6 h350 v-6" />
      </g>

      {/* 4H row */}
      <rect x="110" y="62" width="18" height="30" rx="1.5" className="fill-up" />
      <line x1="119" y1="56" x2="119" y2="98" className="stroke-up" strokeWidth="2" />
      <rect x="290" y="66" width="18" height="24" rx="1.5" className="fill-up" />
      <line x1="299" y1="58" x2="299" y2="96" className="stroke-up" strokeWidth="2" />

      {/* 1D row */}
      <rect x="200" y="122" width="20" height="34" rx="1.5" className="fill-up" />
      <line x1="210" y1="116" x2="210" y2="162" className="stroke-up" strokeWidth="2" />

      <g className="fill-current text-faint" fontSize="9.5">
        <text x="392" y="26">12 bars</text>
        <text x="392" y="86">3 bars</text>
        <text x="392" y="146">1 bar</text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */

const RR_ROWS = [
  { rr: "1 : 1", need: 50 },
  { rr: "1 : 2", need: 33.4 },
  { rr: "1 : 3", need: 25 },
  { rr: "1 : 5", need: 16.7 },
];

function RiskRewardGrid() {
  return (
    <div className="space-y-2.5">
      {RR_ROWS.map((r) => (
        <div key={r.rr} className="flex items-center gap-3">
          <span className="w-14 shrink-0 font-mono text-xs text-ink tnum">{r.rr}</span>
          <div className="relative h-6 flex-1 overflow-hidden rounded border border-line bg-raised">
            <div
              className="h-full bg-accent/30"
              style={{ width: `${r.need}%` }}
            />
            <span className="absolute inset-y-0 left-2 flex items-center font-mono text-2xs text-ink tnum">
              {r.need}% win rate to break even
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
