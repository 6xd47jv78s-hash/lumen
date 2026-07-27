import type { ChartSpec } from "@/lib/market/types";

interface Base {
  id: string;
  title: string;
  /** The instruction shown above the chart. */
  brief: string;
  spec: ChartSpec;
  /** Shown after grading — teach the reasoning, not just the answer. */
  debrief: string[];
  difficulty: 1 | 2 | 3;
  /** Practice-page grouping. */
  mode: "trend" | "levels" | "breakout" | "false-signal";
}

/** Student clicks the chart to place horizontal levels; graded against model zones. */
export interface LevelsExercise extends Base {
  kind: "levels";
  targets: { anchor: string; label: string; kind: "support" | "resistance" | "neutral" }[];
  /** Half-width of the accepted band, as a percentage of the target price. */
  tolerancePct: number;
  maxLevels: number;
}

/** Student clicks the one bar that answers the question. */
export interface BarExercise extends Base {
  kind: "bar";
  answerAnchor: string;
  /** Bars either side of the answer that also count as correct. */
  window: number;
  /** Optional targeted feedback for common wrong picks. */
  traps?: { anchor: string; window: number; message: string }[];
}

/** Multiple choice about what the chart is showing. */
export interface ChoiceExercise extends Base {
  kind: "choice";
  question: string;
  options: string[];
  answer: number;
  /** Per-option feedback; index-aligned with `options`. */
  optionFeedback?: string[];
}

export type Exercise = LevelsExercise | BarExercise | ChoiceExercise;

export const MODE_LABEL: Record<Base["mode"], string> = {
  trend: "Spot the trend",
  levels: "Mark support & resistance",
  breakout: "Identify the breakout",
  "false-signal": "Find the false signal",
};
