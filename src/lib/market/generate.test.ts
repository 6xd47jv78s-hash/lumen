import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SCENARIO_IDS, aggregate, getSeries, sma } from "./generate";

/**
 * The generator is load-bearing: exercise model answers and lesson annotations
 * are anchored to the structure it produces. If a scenario silently stops
 * producing the structure it claims, a lesson teaches the wrong thing and a
 * graded exercise marks correct answers wrong. These tests pin that down.
 */

describe("market data generation", () => {
  it("is deterministic for a given seed", () => {
    const a = getSeries("breakout", 88, 115);
    const b = getSeries("breakout", 88, 115);
    assert.deepEqual(a.candles, b.candles);
    assert.deepEqual(a.anchors, b.anchors);
  });

  it("produces different data for different seeds", () => {
    const a = getSeries("uptrend", 1, 100);
    const b = getSeries("uptrend", 2, 100);
    assert.notDeepEqual(a.candles, b.candles);
  });

  for (const scenario of SCENARIO_IDS) {
    describe(scenario, () => {
      const series = getSeries(scenario, 4242, 120);

      it("emits the requested number of bars, with matching volume", () => {
        assert.equal(series.candles.length, 120);
        assert.equal(series.volumes.length, 120);
      });

      it("satisfies OHLC invariants on every bar", () => {
        for (const [i, c] of series.candles.entries()) {
          const where = `${scenario} bar ${i}`;
          assert.ok(Number.isFinite(c.open), `${where}: open not finite`);
          assert.ok(c.low > 0, `${where}: non-positive low`);
          assert.ok(c.high >= c.low, `${where}: high < low`);
          assert.ok(
            c.high >= Math.max(c.open, c.close) - 1e-9,
            `${where}: high below body top`,
          );
          assert.ok(
            c.low <= Math.min(c.open, c.close) + 1e-9,
            `${where}: low above body bottom`,
          );
        }
      });

      it("advances time monotonically", () => {
        for (let i = 1; i < series.candles.length; i++) {
          assert.ok(
            series.candles[i].time > series.candles[i - 1].time,
            `${scenario}: time went backwards at bar ${i}`,
          );
        }
      });

      it("publishes anchors that point at real structure", () => {
        const lows = Math.min(...series.candles.map((c) => c.low));
        const highs = Math.max(...series.candles.map((c) => c.high));

        for (const [key, value] of Object.entries(series.anchors)) {
          assert.ok(Number.isFinite(value), `${scenario}: anchor ${key} is not a number`);

          if (key.startsWith("bar.")) {
            assert.ok(
              Number.isInteger(value) && value >= 0 && value < series.candles.length,
              `${scenario}: bar anchor ${key} = ${value} is not a valid index`,
            );
          } else if (key.startsWith("price.")) {
            // Measured-move targets are projections and legitimately sit
            // outside the rendered range; every other price anchor must be a
            // level price actually visited.
            if (key === "price.target") continue;
            assert.ok(
              value >= lows * 0.98 && value <= highs * 1.02,
              `${scenario}: price anchor ${key} = ${value} sits outside the series range ${lows}–${highs}`,
            );
          } else {
            assert.fail(`${scenario}: anchor ${key} uses an unrecognised namespace`);
          }
        }
      });
    });
  }

  it("range: price actually reacts at both declared levels", () => {
    const { candles, anchors } = getSeries("range", 44, 110);
    const res = anchors["price.resistance"];
    const sup = anchors["price.support"];
    const nearRes = candles.filter((c) => Math.abs(c.high - res) / res < 0.005).length;
    const nearSup = candles.filter((c) => Math.abs(c.low - sup) / sup < 0.005).length;
    assert.ok(nearRes >= 3, `expected 3+ tests of resistance, saw ${nearRes}`);
    assert.ok(nearSup >= 3, `expected 3+ tests of support, saw ${nearSup}`);
    assert.ok(res > sup, "resistance must sit above support");
  });

  it("fakeout: the trap bar pokes above resistance and closes back inside", () => {
    const { candles, anchors } = getSeries("fakeout", 617, 115);
    const trap = candles[anchors["bar.trap"]];
    const res = anchors["price.resistance"];
    assert.ok(trap.high > res, "trap bar should trade above resistance");
    assert.ok(trap.close < res, "trap bar should close back below resistance");
  });

  it("breakout: the breakout bar closes above resistance on expanded volume", () => {
    const { candles, volumes, anchors } = getSeries("breakout", 88, 115);
    const i = anchors["bar.breakout"];
    const res = anchors["price.resistance"];
    assert.ok(candles[i].close > res, "breakout bar should close above resistance");

    const avg =
      volumes.slice(Math.max(0, i - 20), i).reduce((a, v) => a + v.value, 0) /
      Math.min(20, i);
    assert.ok(
      volumes[i].value > avg * 1.5,
      `breakout volume ${volumes[i].value} should clearly exceed the ${Math.round(avg)} average`,
    );
  });

  it("stop-hunt: the sweep wicks below support and closes back above it", () => {
    const { candles, anchors } = getSeries("stop-hunt", 733, 110);
    const bar = candles[anchors["bar.hunt"]];
    const sup = anchors["price.support"];
    assert.ok(bar.low < sup, "sweep should trade below support");
    assert.ok(bar.close > sup, "sweep should close back above support");
  });

  it("double-top: both peaks reach the same ceiling and the neckline sits below", () => {
    const { candles, anchors } = getSeries("double-top", 512, 120);
    const peak = anchors["price.peak"];
    const p1 = candles[anchors["bar.peak1"]].high;
    const p2 = candles[anchors["bar.peak2"]].high;
    assert.ok(Math.abs(p1 - p2) / peak < 0.01, "peaks should be within 1% of each other");
    assert.ok(anchors["price.neckline"] < peak, "neckline must sit below the peaks");
  });

  it("uptrend: swing structure really does make higher highs and higher lows", () => {
    const { candles, anchors } = getSeries("uptrend", 71, 110);
    const highAt = (i: number) =>
      Math.max(...candles.slice(Math.max(0, i - 3), i + 4).map((c) => c.high));
    const lowAt = (i: number) =>
      Math.min(...candles.slice(Math.max(0, i - 3), i + 4).map((c) => c.low));

    assert.ok(highAt(anchors["bar.high2"]) > highAt(anchors["bar.high1"]), "H2 must exceed H1");
    assert.ok(highAt(anchors["bar.high3"]) > highAt(anchors["bar.high2"]), "H3 must exceed H2");
    assert.ok(lowAt(anchors["bar.low2"]) > lowAt(anchors["bar.low1"]), "L2 must exceed L1");
    assert.ok(lowAt(anchors["bar.low3"]) > lowAt(anchors["bar.low2"]), "L3 must exceed L2");
  });

  it("aggregate: keeps the first open, last close and the group extremes", () => {
    const series = getSeries("intraday-noise", 512, 96);
    const rolled = aggregate(series, 4);
    assert.equal(rolled.candles.length, 24);

    const group = series.candles.slice(0, 4);
    const first = rolled.candles[0];
    assert.equal(first.open, group[0].open);
    assert.equal(first.close, group[3].close);
    assert.equal(first.high, Math.max(...group.map((c) => c.high)));
    assert.equal(first.low, Math.min(...group.map((c) => c.low)));
    assert.equal(
      rolled.volumes[0].value,
      series.volumes.slice(0, 4).reduce((a, v) => a + v.value, 0),
    );
  });

  it("sma: drops the leading window and averages the right closes", () => {
    const { candles } = getSeries("uptrend", 9, 60);
    const out = sma(candles, 20);
    assert.equal(out.length, 60 - 20 + 1);
    assert.equal(out[0].time, candles[19].time);

    const expected =
      candles.slice(0, 20).reduce((a, c) => a + c.close, 0) / 20;
    assert.ok(Math.abs(out[0].value - expected) < 0.01, "first SMA value is wrong");
  });
});
