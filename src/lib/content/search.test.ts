import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SEARCH_INDEX, search } from "./search";
import { ALL_LESSONS, ORDERED_TRACKS } from "./registry";
import { GLOSSARY } from "@/content/glossary";
import { EXERCISES } from "@/content/exercises";

const top = (q: string) => search(q, 1)[0]?.doc;
const titles = (q: string, n = 8) => search(q, n).map((h) => h.doc.title);

describe("SEARCH_INDEX", () => {
  it("covers every lesson, track, term and exercise", () => {
    const byKind = (k: string) => SEARCH_INDEX.filter((d) => d.kind === k).length;
    assert.equal(byKind("lesson"), ALL_LESSONS.length);
    assert.equal(byKind("track"), ORDERED_TRACKS.length);
    assert.equal(byKind("term"), GLOSSARY.length);
    assert.equal(byKind("exercise"), EXERCISES.length);
  });

  it("gives every document a unique id and a non-empty title and href", () => {
    const ids = SEARCH_INDEX.map((d) => d.id);
    assert.equal(new Set(ids).size, ids.length, "duplicate document ids");
    for (const d of SEARCH_INDEX) {
      assert.ok(d.title.trim(), `${d.id} has no title`);
      assert.match(d.href, /^\/[^\s]*$/, `${d.id} has a suspect href: ${d.href}`);
    }
  });

  it("points every lesson and track document at a route that exists", () => {
    const lessonHrefs = new Set(ALL_LESSONS.map((l) => `/learn/${l.track.slug}/${l.lesson.slug}`));
    const trackHrefs = new Set(ORDERED_TRACKS.map((t) => `/learn/${t.slug}`));
    for (const d of SEARCH_INDEX) {
      if (d.kind === "lesson") assert.ok(lessonHrefs.has(d.href), `dead lesson href ${d.href}`);
      if (d.kind === "track") assert.ok(trackHrefs.has(d.href), `dead track href ${d.href}`);
    }
  });

  it("lower-cases every secondary term so scoring never has to", () => {
    for (const d of SEARCH_INDEX) {
      for (const t of d.terms) {
        assert.equal(t, t.toLowerCase(), `${d.id} has an un-lowered term: ${t}`);
      }
    }
  });
});

describe("search", () => {
  it("returns nothing for an empty or whitespace query", () => {
    assert.deepEqual(search(""), []);
    assert.deepEqual(search("   "), []);
  });

  it("puts the obvious answer first", () => {
    assert.match(top("stop loss")!.title, /stop-loss/i);
    assert.match(top("position sizing")!.title, /position sizing/i);
    assert.match(top("candlestick")!.title, /candlestick/i);
    assert.equal(top("fomc")!.title, "FOMC");
  });

  // Substring-anywhere matching ranked "Loss aversion" and "Mean reversion" for
  // "rsi". Matching is anchored to word starts precisely to stop that.
  it("does not match a token buried inside a word", () => {
    const t = titles("rsi");
    assert.ok(!t.includes("Loss aversion"), `"rsi" matched Loss aversion: ${t.join(", ")}`);
    assert.ok(!t.includes("Mean reversion"), `"rsi" matched Mean reversion: ${t.join(", ")}`);
  });

  it("still finds a term by an alias", () => {
    assert.equal(top("rsi")!.title, "Indicator");
    assert.equal(top("macd")!.title, "Indicator");
  });

  it("matches a prefix of a word, since a prefix starts at a boundary", () => {
    assert.match(top("candlest")!.title, /candlestick/i);
    assert.match(top("position siz")!.title, /position sizing/i);
  });

  it("narrows as tokens are added, never widens", () => {
    for (const [broad, narrow] of [
      ["risk", "risk reward"],
      ["volume", "volume divergence"],
    ]) {
      assert.ok(
        search(narrow, 50).length <= search(broad, 50).length,
        `"${narrow}" returned more than "${broad}"`,
      );
    }
  });

  it("requires every token to match something", () => {
    assert.deepEqual(search("volume zzzzz"), []);
  });

  it("returns nothing for a query that matches nothing", () => {
    assert.deepEqual(search("zzzzzqqq"), []);
  });

  it("respects the result limit", () => {
    assert.ok(search("a", 3).length <= 3);
  });
});
