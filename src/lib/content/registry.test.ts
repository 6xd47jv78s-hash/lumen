import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_LESSONS, ORDERED_TRACKS, getLessonRef, neighbours } from "./registry";

/**
 * Structural guarantees the content audit can't make, because it reads source
 * text rather than the evaluated content tree. A quiz whose `answer` points
 * past the end of its options renders a knowledge check that can never be
 * passed — which silently locks the rest of the track.
 */
describe("course content", () => {
  it("orders tracks without gaps or ties", () => {
    const orders = ORDERED_TRACKS.map((t) => t.order);
    assert.deepEqual(orders, [...orders].sort((a, b) => a - b), "tracks are not sorted");
    assert.equal(new Set(orders).size, orders.length, "two tracks share an order");
  });

  it("has globally unique lesson slugs", () => {
    const slugs = ALL_LESSONS.map((l) => l.lesson.slug);
    assert.equal(new Set(slugs).size, slugs.length, "duplicate lesson slug");
  });

  it("uses url-safe slugs throughout", () => {
    for (const { track, module, lesson } of ALL_LESSONS) {
      for (const [kind, slug] of [
        ["track", track.slug],
        ["module", module.slug],
        ["lesson", lesson.slug],
      ] as const) {
        assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${kind} slug "${slug}" is not url-safe`);
      }
    }
  });

  it("links every lesson into a navigable chain", () => {
    for (const ref of ALL_LESSONS) {
      assert.equal(getLessonRef(ref.lesson.slug)?.lesson.slug, ref.lesson.slug);
      const { prev, next } = neighbours(ref.lesson.slug);
      if (ref.index > 0) assert.equal(prev?.index, ref.index - 1);
      if (ref.index < ALL_LESSONS.length - 1) assert.equal(next?.index, ref.index + 1);
    }
    assert.equal(neighbours(ALL_LESSONS[0].lesson.slug).prev, undefined);
    assert.equal(
      neighbours(ALL_LESSONS[ALL_LESSONS.length - 1].lesson.slug).next,
      undefined,
    );
  });

  for (const { track, lesson } of ALL_LESSONS) {
    describe(`${track.slug}/${lesson.slug}`, () => {
      it("has a plausible shape", () => {
        assert.ok(lesson.title.length > 5, "title is a stub");
        assert.ok(lesson.minutes >= 3 && lesson.minutes <= 20, `minutes = ${lesson.minutes}`);
        assert.ok(lesson.blocks.length >= 6, "suspiciously few blocks");
      });

      it("lands a key takeaway", () => {
        const keys = lesson.blocks.filter(
          (b) => b.type === "callout" && b.variant === "key",
        );
        assert.equal(keys.length, 1, `expected exactly one key takeaway, found ${keys.length}`);
        // The takeaway belongs at the end, after the material it summarises.
        const last = lesson.blocks[lesson.blocks.length - 1];
        assert.ok(
          last.type === "callout" && last.variant === "key",
          "key takeaway is not the closing block",
        );
      });

      it("has a knowledge check that can actually be passed", () => {
        assert.ok(
          lesson.quiz.length >= 3 && lesson.quiz.length <= 5,
          `quiz has ${lesson.quiz.length} questions; the brief calls for 3–5`,
        );

        const ids = lesson.quiz.map((q) => q.id);
        assert.equal(new Set(ids).size, ids.length, "duplicate question id");

        for (const q of lesson.quiz) {
          assert.ok(q.options.length >= 3, `${q.id}: fewer than three options`);
          assert.equal(
            new Set(q.options).size,
            q.options.length,
            `${q.id}: duplicate option text`,
          );
          assert.ok(
            Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length,
            `${q.id}: answer index ${q.answer} is out of range — this quiz can never be passed`,
          );
          assert.ok(q.prompt.trim().length > 15, `${q.id}: prompt is a stub`);
          assert.ok(
            q.explain.trim().length > 40,
            `${q.id}: explanation is a stub — the explanation is the teaching`,
          );
        }
      });

      it("has no empty prose", () => {
        for (const b of lesson.blocks) {
          if (b.type === "p") assert.ok(b.text.trim().length > 20, "empty paragraph");
          if (b.type === "h") assert.ok(b.text.trim().length > 2, "empty heading");
          if (b.type === "list") assert.ok(b.items.length > 1, "single-item list");
          if (b.type === "table") {
            for (const row of b.rows) {
              assert.equal(
                row.length,
                b.headers.length,
                `table row has ${row.length} cells but ${b.headers.length} headers`,
              );
            }
          }
        }
      });
    });
  }
});
