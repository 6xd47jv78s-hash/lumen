# Lumen V1

The production backbone — accounts, payments, a database, and a **secure server-side**
generation/verification API — that the single-file prototype can't have. You keep the
prototype's UI; this is everything underneath it.

## The fastest path to a real V1

**Cut scope.** V1 ships **one curriculum, ~5 subjects, a verified core** of the most-searched
topics. Everything else generates on demand and is self-checked. No full verification, no 156
subjects, no marketing polish. Expand *after* launch.

**Use managed services — don't hand-roll infra:**

| concern | use | why |
|---|---|---|
| hosting | **Vercel** | Next.js deploys in minutes |
| database | **Neon / Supabase** (Postgres) | managed, free tier |
| auth | **Clerk** (or Supabase Auth) | accounts without building auth |
| payments | **Stripe** | checkout + webhooks |
| AI | **Anthropic** (server-side) | secure, cached to DB |

**Port the prototype, don't rebuild it.** The study UI already exists — swap its in-browser
`GEN.*` calls for `src/lib/api-client.ts`; swap `window.storage` for the database.

## Prototype → production map

| prototype | production (this repo) |
|---|---|
| in-browser `fetch` to Anthropic (no key) | `src/app/api/generate` (server, key in env) |
| `window.storage` cache | Postgres (`Note`, `GenerationCache`) |
| account setup in `window.storage` | `User` + auth provider |
| "Import verified notes" (manifest.json) | `src/lib/seed-manifest.ts` → DB |
| objective self-critique in browser | `getObjectiveNote()` server-side |
| spec manifest drives tree + notes | `Subject`/`Topic`/`Objective`/`Note` tables |

## Setup

```bash
npm install
# add an auth provider (e.g. `npm i @clerk/nextjs`) and wire src/lib/auth.ts
cp .env.example .env            # fill in DATABASE_URL, ANTHROPIC_API_KEY, Stripe, auth
npx prisma migrate dev          # create the schema
npm run seed -- ./manifest.json # load verified content from the notes pipeline
npm run dev
```

Deploy: push to GitHub → import on Vercel → add the env vars → done.

## What's here vs what's left

**Here (the hard backbone):** data model, secure generation + live self-critique API, topic
resolution from the spec, the pipeline→DB seeder, the frontend API client, payments/auth
integration points.

**You add:** the auth provider wiring (`src/lib/auth.ts`), the Stripe checkout + webhook route,
and the **ported UI pages** (lift the prototype's study workspace into `src/app`, calling
`api-client.ts`). The marketing site can stay as the existing static page.

## Accelerated plan (focused daily work)

1. **Week 1** — stand up the stack: deploy this scaffold, wire Clerk + Stripe, migrate the DB,
   port the study UI onto the API. *Outcome: a real, logged-in, paid app skeleton.*
2. **Week 2** — run the **notes pipeline** for your V1 subjects (batch generation, overnight),
   seed the DB. Content drafting for the whole V1 set happens here, in compute time.
3. **Weeks 3–4** — human-review the **verified core** (highest-traffic topics) via the review
   queue; everything else stays AI-generated + self-checked. Polish, QA, onboarding.
4. **Parallel track (start now, runs alongside):** the things model time can't compress —
   **content review** (subject experts), and the **launch essentials**: privacy policy + data
   protection (your users are often minors — this is non-negotiable), exam-board copyright check,
   and terms. These gate launch as much as code does.

Disciplined, that's a **real, launchable V1 in ~4–6 weeks of focused build** — with the verified
core growing after launch. The code/pipeline is the fast part; review + legal + infra run in
parallel and set the true date.
