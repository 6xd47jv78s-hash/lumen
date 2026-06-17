# Lumen Notes Pipeline

The fastest reliable way to fill out notes for every subject is **not** to hand‑write
them and **not** to let a model free‑write from memory. It's to generate **one note
per official specification objective**, then **verify** before publishing. This repo
does exactly that.

```
spec (PDF / list)
      │  ingest.py        parse the official spec into discrete objectives
      ▼
objectives.json
      │  generate.py      one spec‑grounded note per objective  (Batch API, ~50% cheaper)
      ▼
notes_draft.jsonl
      │  verify.py        a *different* model grades each note vs its objective
      ▼
notes_checked.jsonl       (approved | flagged)
      │  review.py        human review queue (flagged first) + app‑ready pack.json
      ▼
build/review_queue.html  +  build/manifest.json  ──►  Import into the Lumen app (Import verified notes)
```

## Why this is accurate (and fast)

1. **Grounded in the official spec.** Every objective comes from the board's own
   specification, so you can't miss a topic and the model is told to cover *exactly*
   that objective and **omit rather than guess**. This kills most scope‑drift and
   hallucination. Boards publish full specs free: AQA, Edexcel/Pearson, OCR,
   Cambridge (CAIE), IBO subject guides, College Board AP CEDs.
2. **Two models, not one.** A strong model writes; a different strong model checks.
   No model grades its own homework.
3. **Batch generation.** `generate.py --mode batch` submits the whole subject (or the
   whole curriculum) to the Anthropic Message Batches API at once — roughly half the
   cost, results within ~24h. Drafting everything becomes *days of compute, not years
   of writing*.
4. **Humans where it counts.** Reviewing/correcting a draft is several times faster
   than writing from scratch. Prioritise the high‑traffic core and the error‑prone
   material (formulae, dates, mark‑scheme phrasing). Let the long tail stay
   AI‑generated + self‑checked in‑app until it earns a human pass.

## Draft every subject at once

`subjects.config.json` lists your V1 target (one curriculum, a handful of subjects), each
pointing at its spec file. Then one command drafts them all:

```bash
python build_all.py --mock          # offline dry-run of the whole config
python build_all.py                 # real run (needs ANTHROPIC_API_KEY)
python build_all.py --only "Biology,Chemistry" --force   # subset, re-draft
python status.py                    # coverage so far (objs / verified / awaiting review)
```

Each subject is drafted into `build/<curriculum>/<subject>/` and **resumable** — already-done
subjects are skipped unless `--force`, so a long run can be stopped and continued. Every subject
of a curriculum is merged into one importable `build/<curriculum>-manifest.json`.

Edit `subjects.config.json` to add subjects or whole curricula; drop each spec into `specs/`.

## Quick start (offline demo — no API key)

```bash
python run.py --input sample_spec.md --curriculum GCSE --board AQA --subject "Biology" --mock
open build/review_queue.html      # see the queue, flags, and editing
```

## Real run

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-...

# one subject from a spec PDF, cheap bulk generation:
python run.py --input specs/aqa_gcse_biology.pdf \
    --curriculum GCSE --board AQA --subject "Biology"
```

Then open `build/review_queue.html`, approve/flag/edit, click **Download approved
pack**, and in the Lumen app use **Import verified notes** to load `pack.json`.
Imported topics render with a **Verified** badge instead of being generated live.

## Scaling to the whole curriculum

Run one `(board, subject)` at a time — each is independent, so you can parallelise.
A driver that loops your subject list and calls `run.py` per subject is all you need;
`generate.py --mode batch` already batches every objective within a subject.

## The unified manifest (single source of truth)

`build/manifest.json` is the one file that drives **both** the app's structure and its
content. Shape:

```json
{ "curriculum": "GCSE", "board": "AQA",
  "subjects": { "Biology": { "Cell structure": [
        {"spec_ref":"4.1.1.1","objective":"…","status":"approved","note":{…}},
        {"spec_ref":"4.1.1.4","objective":"…","status":"flagged"} ] } } }
```

Import it with **Import verified notes**. For covered subjects the app then takes its
**topics from the spec**, lists each **objective**, shows the **verified note** where
one exists (gold *Verified* badge), and **generates + self-checks** the rest on demand.
Subjects with no manifest keep generating their topics and notes as before. So the spec
is the single source: same objectives feed the tree and the notes.

## Models

Configurable via env vars (see `config.py`): `LUMEN_GEN_MODEL` (writer),
`LUMEN_CRITIC_MODEL` (checker), `LUMEN_INGEST_MODEL` (spec parsing).

## Files

| file | stage |
|------|-------|
| `ingest.py`   | spec → `objectives.json` |
| `generate.py` | objectives → `notes_draft.jsonl` (batch/sync/mock) |
| `verify.py`   | drafts → `notes_checked.jsonl` (critic) |
| `review.py`   | checked → `review_queue.html` + `pack.json` |
| `run.py`      | runs all four |
| `prompts.py`  | the generation + critic + ingest prompts (the accuracy contract) |
| `schema.py`   | note‑shape validation |
| `config.py`   | models, paths, the note schema |
| `llm.py`      | Anthropic Messages + Batch API, and offline mocks |
