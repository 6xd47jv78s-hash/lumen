import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { THEME_BOOT_SCRIPT, THEME_KEY } from "./theme";

/**
 * Runs the pre-paint boot script against stub globals and reports what it did
 * to the document element.
 */
function boot(stored: string | null) {
  const classes = new Set<string>();
  const style: { colorScheme?: string } = {};
  const document = {
    documentElement: {
      classList: {
        add: (c: string) => classes.add(c),
        remove: (c: string) => classes.delete(c),
      },
      style,
    },
  };
  const localStorage = { getItem: (k: string) => (k === THEME_KEY ? stored : null) };
  new Function("localStorage", "document", THEME_BOOT_SCRIPT)(localStorage, document);
  return { classes: [...classes], colorScheme: style.colorScheme };
}

const persisted = (theme: string) => JSON.stringify({ state: { theme }, version: 0 });

describe("THEME_BOOT_SCRIPT", () => {
  it("adds the light class for a stored light preference", () => {
    const r = boot(persisted("light"));
    assert.deepEqual(r.classes, ["light"]);
    assert.equal(r.colorScheme, "light");
  });

  it("adds no class for a stored dark preference", () => {
    const r = boot(persisted("dark"));
    assert.deepEqual(r.classes, []);
    assert.equal(r.colorScheme, "dark");
  });

  it("adds no class for a first-time visitor", () => {
    assert.deepEqual(boot(null).classes, []);
  });

  // The script is inlined into <head> and runs before anything else. If a bad
  // localStorage value could throw past the catch, the page would never paint.
  it("survives corrupt persisted state without throwing", () => {
    for (const bad of ["", "not json", "{}", '{"state":null}', "[]", "null"]) {
      assert.doesNotThrow(() => boot(bad), `threw on ${JSON.stringify(bad)}`);
      assert.deepEqual(boot(bad).classes, [], `classed the document on ${JSON.stringify(bad)}`);
    }
  });

  // Dark must be reachable without the script running at all — `notFound()` from
  // a nested route renders in Next's error shell, which drops the root layout's
  // <head> and with it this script.
  it("never adds a dark class, whatever is stored", () => {
    for (const s of [null, persisted("dark"), persisted("light"), "garbage"]) {
      assert.ok(!boot(s).classes.includes("dark"), `added "dark" for ${String(s)}`);
    }
  });
});

describe("theme stylesheet polarity", () => {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

  it("puts the dark tokens on :root and light behind .light", () => {
    const root = css.match(/:root\s*\{([\s\S]*?)\n {2}\}/);
    const light = css.match(/\.light\s*\{([\s\S]*?)\n {2}\}/);
    assert.ok(root, "no :root block found");
    assert.ok(light, "no .light block found");
    assert.match(root[1], /--c-base:\s*9 11 16/, ":root should carry the dark base colour");
    assert.match(light[1], /--c-base:\s*250 251 253/, ".light should carry the paper base colour");
    assert.match(root[1], /color-scheme:\s*dark/);
    assert.match(light[1], /color-scheme:\s*light/);
  });

  it("has no .dark rule left for the boot script to miss", () => {
    assert.doesNotMatch(css, /^\s*\.dark\s*\{/m);
  });
});
