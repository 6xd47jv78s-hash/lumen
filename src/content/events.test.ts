import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildEvents } from "./events";

/**
 * The event board claims two of its schedules follow genuinely stable public
 * conventions — US payrolls on the first Friday, monthly crypto expiry on the
 * last Friday — and badges everything else `est. date`. If the recurrence maths
 * drifts, the site starts presenting a wrong date as a reliable one, which is
 * the one thing the honesty framing on /watch promises it won't do.
 */

const FRIDAY = 5;

function isFirstFridayUTC(d: Date): boolean {
  return d.getUTCDay() === FRIDAY && d.getUTCDate() <= 7;
}

function isLastFridayUTC(d: Date): boolean {
  if (d.getUTCDay() !== FRIDAY) return false;
  const next = new Date(d);
  next.setUTCDate(next.getUTCDate() + 7);
  return next.getUTCMonth() !== d.getUTCMonth();
}

describe("market events", () => {
  // A year of start dates, so the rules are exercised across month lengths,
  // leap years and week alignments rather than just today's calendar.
  const starts = Array.from({ length: 26 }, (_, i) => {
    const d = new Date(Date.UTC(2026, 0, 1));
    d.setUTCDate(d.getUTCDate() + i * 14);
    return d;
  });

  it("returns events in chronological order, inside the horizon", () => {
    for (const from of starts) {
      const events = buildEvents(from, 45);
      const times = events.map((e) => new Date(e.at).getTime());
      assert.deepEqual(times, [...times].sort((a, b) => a - b), "events are not sorted");

      for (const e of events) {
        const t = new Date(e.at).getTime();
        assert.ok(t >= from.getTime(), `${e.short} is in the past`);
        assert.ok(
          t <= from.getTime() + 46 * 86400000,
          `${e.short} falls outside the 45-day horizon`,
        );
      }
    }
  });

  it("never emits duplicate ids in a window", () => {
    for (const from of starts) {
      const ids = buildEvents(from, 45).map((e) => e.id);
      assert.equal(new Set(ids).size, ids.length, `duplicate event id from ${from.toISOString()}`);
    }
  });

  it("always has something on the board", () => {
    for (const from of starts) {
      const events = buildEvents(from, 45);
      assert.ok(events.length >= 8, `only ${events.length} events from ${from.toISOString()}`);
      assert.ok(
        events.some((e) => e.impact === "high"),
        `no high-impact event in 45 days from ${from.toISOString()}`,
      );
    }
  });

  it("puts US payrolls on the first Friday of the month", () => {
    for (const from of starts) {
      for (const e of buildEvents(from, 60).filter((x) => x.short === "NFP")) {
        const d = new Date(e.at);
        assert.ok(
          isFirstFridayUTC(d),
          `NFP on ${d.toISOString()} is not the first Friday of its month`,
        );
        assert.equal(e.ruleBased, true, "NFP should be marked rule-based");
      }
    }
  });

  it("puts monthly crypto expiry on the last Friday of the month", () => {
    for (const from of starts) {
      for (const e of buildEvents(from, 60).filter((x) => x.short === "Expiry")) {
        const d = new Date(e.at);
        assert.ok(
          isLastFridayUTC(d),
          `expiry on ${d.toISOString()} is not the last Friday of its month`,
        );
        assert.equal(e.ruleBased, true, "expiry should be marked rule-based");
      }
    }
  });

  it("marks every non-conventional schedule as an estimate", () => {
    const ruleBased = new Set(["NFP", "Expiry"]);
    for (const e of buildEvents(new Date(Date.UTC(2026, 4, 11)), 60)) {
      assert.equal(
        e.ruleBased,
        ruleBased.has(e.short),
        `${e.short}: ruleBased flag disagrees with whether its schedule is a real convention`,
      );
    }
  });

  it("gives every event the editorial fields the board depends on", () => {
    for (const e of buildEvents(new Date(Date.UTC(2026, 2, 3)), 60)) {
      assert.ok(e.whyWatched.length > 80, `${e.short}: whyWatched is a stub`);
      assert.ok(e.watchFor.length >= 2, `${e.short}: fewer than two things to watch for`);
      for (const w of e.watchFor) assert.ok(w.length > 25, `${e.short}: watchFor item is a stub`);
      assert.ok(e.assets.length > 0, `${e.short}: no asset classes tagged`);
      assert.ok(e.title.length > 5 && e.short.length > 1, `${e.short}: naming is a stub`);
    }
  });

  it("never recommends an instrument or a direction", () => {
    // The board's whole promise is "when and why, never what to buy". This is
    // the automated half of keeping that promise.
    const banned = /\b(buy|sell|short|long|go long|go short|target price|price target)\b/i;
    for (const e of buildEvents(new Date(Date.UTC(2026, 6, 6)), 60)) {
      const prose = [e.whyWatched, ...e.watchFor].join(" ");
      const hit = prose.match(banned);
      assert.equal(
        hit,
        null,
        `${e.short}: event copy contains directional language ("${hit?.[0]}")`,
      );
    }
  });
});
