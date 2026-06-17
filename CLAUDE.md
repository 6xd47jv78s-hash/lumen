# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read this first. It onboards you onto the project and the V1 goal.

## What we're building
Lumen is an AI study platform covering IB, IGCSE, GCSE, AP and A-Level. A student picks
their curriculum + subjects at signup, and the app gives them, per topic: **Notes,
Flashcards, Quiz, Past Papers, and an AI Tutor.** Content is generated per specification
objective and **verified before it is trusted**.

## V1 scope (ship THIS, not the whole vision)
- **One curriculum, ~5 subjects, a verified core** of the highest-traffic topics.
- Everything else: AI-generated on demand + self-checked (clearly labelled).
- Includes: accounts, payments, the study workspace, secure server-side generation.
- NOT in V1: all ~156 subjects, full human verification, marketing polish.

## Repo layout
- **`lumen-v1/`** — the real app scaffold (Next.js App Router + Prisma + Postgres). The backbone. **Start here.**
  - data model: `prisma/schema.prisma`
  - secure server-side generation + self-critique: `src/lib/generate.ts`, `src/lib/anthropic.ts`, `src/lib/prompts.ts`
  - API routes: `src/app/api/generate/route.ts`, `src/app/api/topics/route.ts`
  - pipeline → DB seeder: `src/lib/seed-manifest.ts`
  - auth + quota stub to wire up: `src/lib/auth.ts`
  - frontend API client: `src/lib/api-client.ts`
- **`lumen-notes-pipeline/`** — Python pipeline that drafts + verifies notes from a spec and
  outputs `manifest.json`. One subject via `run.py`; the whole config via `build_all.py`;
  coverage via `status.py`.
- **`lumen-study.html`**, **`lumen-website.html`** — working prototypes: the study UI to port,
  and the marketing landing page.

## Stack (don't hand-roll infrastructure)
Next.js (App Router) · Postgres (Neon or Supabase) · managed auth (Clerk or Supabase Auth) ·
Stripe (payments) · Vercel (hosting) · Anthropic (generation, **server-side only**).

## Commands

### `lumen-v1/` (Next.js — run from inside `lumen-v1/`)
```bash
npm install                       # install dependencies
cp .env.example .env              # then fill in DATABASE_URL, ANTHROPIC_API_KEY, Stripe, auth
npx prisma migrate dev            # create/apply the DB schema (also: npm run db:migrate)
npm run db:push                   # push schema without a migration (quick dev iteration)
npm run dev                       # start the dev server (http://localhost:3000)
npm run build                     # prisma generate + next build (production build)
npm run seed -- ./manifest.json   # load spec structure + verified notes from a pipeline manifest
```
There is no test runner or linter configured yet.

### `lumen-notes-pipeline/` (Python — run from inside `lumen-notes-pipeline/`)
```bash
pip install -r requirements.txt
python run.py --input sample_spec.md --curriculum GCSE --board AQA --subject "Biology" --mock   # offline demo, no API key
python build_all.py --mock                 # offline dry-run of the whole subjects.config.json
python build_all.py                         # real run (needs ANTHROPIC_API_KEY)
python build_all.py --only "Biology,Chemistry" --force   # subset, force re-draft
python status.py                            # coverage report (objectives / verified / awaiting review)
```
`--mock` runs everything offline with no API key — always use it to test first. Real runs read
`ANTHROPIC_API_KEY` from the environment. Output lands in `build/`.

## How generation works (the core data flow)
The single-file prototype called Anthropic **from the browser** and cached in `window.storage`.
V1 moves both server-side. The chain:

1. `src/app/api/*/route.ts` — validates input with `zod`, guards with `getUser`/`withinQuota`
   from `src/lib/auth.ts` (returns 401/429), then calls into `src/lib/generate.ts`.
2. `src/lib/generate.ts` — the brain:
   - `getObjectiveNote()`: APPROVED note in DB → return as **verified**; existing draft → reuse;
     otherwise generate with the writer model, **self-critique with a different model**, store
     as `DRAFT` (or `FLAGGED` if the critic says "revise"), and return.
   - `getTopics()`: if the subject was seeded from a manifest, topics come **from the DB/spec**
     (`fromSpec: true`); otherwise generate + cache.
   - `getAux()`: flashcards/quiz/past-papers, cached by `scopeKey` in `GenerationCache`.
3. `src/lib/anthropic.ts` — the only place that touches the Anthropic SDK. `MODELS.gen` (writer)
   and `MODELS.critic` (checker) are two different models on purpose; `parseJson` strips code
   fences and extracts the JSON. **Key is read from `process.env`, server-side only.**
4. `src/lib/api-client.ts` — the browser-side `api.topics/note/aux` helpers; a drop-in for the
   prototype's in-browser `GEN.*` calls. The ported UI imports these.

## Data model (`prisma/schema.prisma`)
- **`User` / `Subscription`** — accounts + Stripe plan ("free" | "pro").
- **`Subject` → `Topic` → `Objective` → `Note`** — the spec structure, seeded from the pipeline
  manifest, is the **single source of truth** for both the navigation tree and the notes.
- **`Note.status`** is `DRAFT` (AI + self-checked) | `FLAGGED` (critic flagged) | `APPROVED`
  (human-signed-off → gold **Verified** badge). `Note.body` JSON shape must match the pipeline's
  `NOTE_SCHEMA` (`config.py`) and the app's note renderer: `{ summary, sections[], keyTerms[], examTips[] }`.
- **`GenerationCache`** — keyed by `scopeKey` for the non-note generated tabs.

## Pipeline → app contract
`lumen-notes-pipeline` produces `build/manifest.json` (or `pack.json` for a single approved set).
`src/lib/seed-manifest.ts` upserts that into `Subject/Topic/Objective/Note`. Only objectives with
`status: "approved"` get a `Note` row (APPROVED). The note JSON shape is the contract between the
two repos — if you change it in one place, change it in both (`config.py` ↔ `schema.prisma` ↔ renderer).

## What's NOT in the scaffold yet (don't assume it exists)
The `lumen-v1` scaffold is intentionally partial — these are the Week 1 build tasks:
- **No `tsconfig.json`, `next.config.*`, `.gitignore`, or `package-lock.json`** — generated/added during setup.
- **No UI pages** — there is no `src/app/layout.tsx` or `src/app/page.tsx`. Only the two API routes
  exist. `npm run dev` boots, but there is no homepage until the prototype UI is ported (Week 1 step 4).
- **Auth is a stub** — `getUser()` in `src/lib/auth.ts` returns `null`, so **every API route returns
  401** until a provider is wired in. `withinQuota()` always returns `true` (no real quota yet).
- **No Stripe checkout/webhook route** — only the `Subscription` model and env vars exist.

## Week 1 goals
1. Get `lumen-v1` running locally: `npm install`, set up a Postgres database, `npx prisma migrate dev`, `npm run dev`.
2. Wire a managed auth provider into `src/lib/auth.ts` so sign-in actually works.
3. Add a Stripe checkout + webhook route for the "pro" plan.
4. Port the `lumen-study.html` UI into the app as React pages that call `src/lib/api-client.ts`
   (swap the prototype's `window.storage` + in-browser AI calls for the secure API).
5. Seed sample content: run the pipeline (`python build_all.py --mock` first to test), then
   `npm run seed -- <path-to-manifest.json>`.

## Hard constraints
- The **Anthropic API key is SERVER-SIDE ONLY**. Never expose it to the browser.
- **Users are often minors.** A privacy policy, data protection, and basic safeguarding are
  required before any real launch. Exam-board specifications are copyrighted — generate
  **original** notes; never reproduce spec or textbook text.
- Notes flow generate → verify. Unverified notes must be labelled; only human-approved notes
  show the gold **Verified** badge.

## How to work with me
- I'm not a developer. Explain each step in plain English **before** running it, and confirm
  before installing anything or changing files.
- Prefer small, tested changes; run the app after each one so we catch breakage early.
- Read `lumen-v1/README.md` and `lumen-notes-pipeline/README.md` before starting.
</content>
