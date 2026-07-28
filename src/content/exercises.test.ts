import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EXERCISES } from "./exercises";
import { getSeries } from "../lib/market/generate";
import { SCENARIO_IDS } from "../lib/market/generate";

/**
 * Exercise model answers are anchored to generated structure. A tweak to a
 * scenario can silently move that structure, at which point a graded exercise
 * starts marking correct answers wrong — with no type error and no crash, just
 * a student being told they misread a chart they read fine.
 *
 * These tests assert the model answers still describe what the chart shows.
 */

const seriesFor = (e: (typeof EXERCISES)[number]) =>
  getSeries(e.spec.scenario, e.spec.seed, e.spec.bars, e.spec.aggregate);

describe("exercises", () => {
  it("have unique ids", () => {
    const ids = EXERCISES.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate exercise id");
  });

  it("cover every practice mode at more than one difficulty", () => {
    const modes = new Set(EXERCISES.map((e) => e.mode));
    assert.deepEqual(
      [...modes].sort(),
      ["breakout", "false-signal", "levels", "trend"],
      "a practice mode has no exercises",
    );
    // Difficulty 1 must exist, or a new student sees an entirely locked tool.
    assert.ok(
      EXERCISES.some((e) => e.difficulty === 1),
      "no difficulty-1 exercise to unlock the practice tool with",
    );
  });

  for (const e of EXERCISES) {
    describe(`${e.id} (${e.kind})`, () => {
      it("uses a real scenario and has a teaching debrief", () => {
        assert.ok(
          (SCENARIO_IDS as string[]).includes(e.spec.scenario),
          `unknown scenario "${e.spec.scenario}"`,
        );
        assert.ok(e.debrief.length > 0, "debrief is empty");
        for (const line of e.debrief) assert.ok(line.trim().length > 40, "debrief line is a stub");
        assert.ok(e.brief.trim().length > 20, "brief is a stub");
      });

      if (e.kind === "levels") {
        it("targets prices the chart actually reacts at", () => {
          const { candles, anchors } = seriesFor(e);
          for (const target of e.targets) {
            const price = anchors[target.anchor];
            assert.ok(
              price != null,
              `target anchor "${target.anchor}" is missing from the series`,
            );

            // A level worth marking is one price tested more than once.
            const tol = (price * e.tolerancePct) / 100;
            const touches = candles.filter(
              (c) => Math.abs(c.high - price) <= tol || Math.abs(c.low - price) <= tol,
            ).length;
            assert.ok(
              touches >= 2,
              `${target.label}: only ${touches} bar(s) reach ${price} within the ${e.tolerancePct}% grading band — students would be marked wrong for reading the chart correctly`,
            );
          }
        });

        it("allows enough lines to place every target without a stray penalty", () => {
          assert.ok(
            e.maxLevels >= e.targets.length,
            `maxLevels ${e.maxLevels} < ${e.targets.length} targets: full marks are unreachable`,
          );
        });

        it("keeps targets far enough apart to be gradable separately", () => {
          const { anchors } = seriesFor(e);
          const prices = e.targets.map((t) => anchors[t.anchor]).sort((a, b) => a - b);
          for (let i = 1; i < prices.length; i++) {
            const gap = ((prices[i] - prices[i - 1]) / prices[i]) * 100;
            assert.ok(
              gap > e.tolerancePct * 2,
              `targets ${prices[i - 1]} and ${prices[i]} are ${gap.toFixed(2)}% apart, inside twice the ${e.tolerancePct}% tolerance — one line could match both`,
            );
          }
        });
      }

      if (e.kind === "bar") {
        it("points at a bar that exists", () => {
          const { candles, anchors } = seriesFor(e);
          const answer = anchors[e.answerAnchor];
          assert.ok(answer != null, `answer anchor "${e.answerAnchor}" is missing`);
          assert.ok(
            Number.isInteger(answer) && answer >= 0 && answer < candles.length,
            `answer index ${answer} is out of range`,
          );
        });

        it("has traps that are distinguishable from the answer", () => {
          const { anchors } = seriesFor(e);
          const answer = anchors[e.answerAnchor];
          for (const trap of e.traps ?? []) {
            const idx = anchors[trap.anchor];
            assert.ok(idx != null, `trap anchor "${trap.anchor}" is missing`);

            // Overlapping windows would score the same click as both correct
            // (100) and a near-miss (50), depending only on evaluation order.
            const separation = Math.abs(idx - answer);
            assert.ok(
              separation > e.window + trap.window,
              `trap "${trap.anchor}" at bar ${idx} overlaps the answer window around bar ${answer}`,
            );
            assert.ok(trap.message.length > 40, "trap message is a stub");
          }
        });

        it("has a grading window narrow enough to test anything", () => {
          const { candles } = seriesFor(e);
          assert.ok(
            e.window * 2 + 1 < candles.length * 0.15,
            `window of ±${e.window} accepts more than 15% of the chart`,
          );
        });
      }

      if (e.kind === "choice") {
        it("has a valid answer index and complete feedback", () => {
          assert.ok(
            e.answer >= 0 && e.answer < e.options.length,
            `answer index ${e.answer} is out of range for ${e.options.length} options`,
          );
          assert.ok(e.options.length >= 3, "fewer than three options");
          assert.equal(
            new Set(e.options).size,
            e.options.length,
            "duplicate option text",
          );
          if (e.optionFeedback) {
            assert.equal(
              e.optionFeedback.length,
              e.options.length,
              "optionFeedback is not aligned with options",
            );
            for (const f of e.optionFeedback) {
              assert.ok(f.trim().length > 20, "option feedback is a stub");
            }
          }
        });
      }
    });
  }
});
