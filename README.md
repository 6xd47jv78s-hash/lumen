# Lumen

Everything for the Lumen study platform, in one place.

## What's in here

- **CLAUDE.md** — the project brief. Open this folder in Claude Code and it reads this automatically.
- **lumen-website.html** — the animated marketing landing page (prototype). Open in any browser.
- **lumen-study.html** — the study app prototype: account setup → your subjects → Notes,
  Flashcards, Quiz, Past Papers, AI Tutor. Open in a browser (the live AI bits run inside Claude).
- **lumen-v1/** — the **real app to build**: a Next.js + Postgres scaffold with accounts, payments,
  and a secure server-side generation/verification API. This is where V1 gets built.
  See `lumen-v1/README.md`.
- **lumen-notes-pipeline/** — the Python pipeline that drafts and verifies notes from an exam-board
  specification and outputs a `manifest.json` the app imports. See `lumen-notes-pipeline/README.md`.

## Prototypes vs the real thing

The two `.html` files are working **prototypes** — perfect for seeing and demoing the product, but
they can't hold accounts, payments, or a secure API key. **`lumen-v1/`** is the production codebase
that turns them into a real app. Build V1 there.

## How to start

1. Install **Claude Code** — see code.claude.com/docs/en/setup (needs a paid Claude plan).
2. Open this `lumen` folder in Claude Code (the Desktop app, or `cd` into it and run `claude`).
3. First message — paste this:

   > Read CLAUDE.md, then lumen-v1/README.md and lumen-notes-pipeline/README.md, and run /init to
   > map the codebase. Then walk me through Week 1, Step 1: getting lumen-v1 running locally. I'm
   > not very technical — explain each step in plain English before you run it, and check with me
   > before installing anything or changing files.

The V1 scope, plan, and constraints are in **CLAUDE.md** and **lumen-v1/README.md**.

## Try the pipeline right now (free, no key)

```bash
cd lumen-notes-pipeline
python3 build_all.py --mock   # drafts the sample subjects (placeholder content)
python3 status.py             # coverage report
```

That proves the machinery works on your machine. Swap in real exam-board specs and an API key for
real notes (see `lumen-notes-pipeline/README.md`).
