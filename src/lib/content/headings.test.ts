import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { headingId, lessonSections } from "./headings";
import { ALL_LESSONS } from "./registry";

describe("headingId", () => {
  it("slugifies plain prose", () => {
    assert.equal(headingId("How much should you risk?"), "how-much-should-you-risk");
  });

  it("strips inline markup rather than slugifying it", () => {
    assert.equal(headingId("Why *1%* is the `standard`"), "why-1-is-the-standard");
  });

  it("uses the term, not the label, from a glossary link", () => {
    assert.equal(headingId("Reading [[slippage|the gap]]"), "reading-slippage");
    assert.equal(headingId("Reading [[slippage]]"), "reading-slippage");
  });

  it("collapses runs of punctuation and trims the ends", () => {
    assert.equal(headingId("— Stop-losses: placement, not hope —"), "stop-losses-placement-not-hope");
  });
});

describe("lessonSections", () => {
  it("returns only level-2 headings, in document order", () => {
    const lesson = ALL_LESSONS.find((l) => l.lesson.slug === "position-sizing");
    assert.ok(lesson, "position-sizing lesson should exist");
    const sections = lessonSections(lesson.lesson);
    assert.ok(sections.length >= 3, "expected several sections");
    const h2s = lesson.lesson.blocks.filter((b) => b.type === "h" && b.level === 2);
    assert.equal(sections.length, h2s.length);
  });

  it("strips markup from the visible label", () => {
    for (const { lesson } of ALL_LESSONS) {
      for (const s of lessonSections(lesson)) {
        assert.doesNotMatch(
          s.text,
          /[[\]`*]/,
          `${lesson.slug}: section label "${s.text}" still contains markup`,
        );
      }
    }
  });

  // Two identical h2s in one lesson would give the rail two links pointing at
  // the same element, and `document.getElementById` would only ever find the
  // first — the second entry would silently never highlight.
  it("produces a unique, non-empty anchor per section within every lesson", () => {
    for (const { lesson } of ALL_LESSONS) {
      const ids = lessonSections(lesson).map((s) => s.id);
      for (const id of ids) {
        assert.notEqual(id, "", `${lesson.slug}: heading slugified to an empty id`);
      }
      assert.equal(
        new Set(ids).size,
        ids.length,
        `${lesson.slug}: duplicate section anchors — ${ids.join(", ")}`,
      );
    }
  });
});
