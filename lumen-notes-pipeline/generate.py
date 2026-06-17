"""Stage 2 — GENERATE: one spec-grounded note per objective.

Two modes:
  --mode batch  (default, recommended): submits every objective to the Anthropic
                Message Batches API in one go. ~50% cheaper, returns within ~24h.
                Drafting the WHOLE curriculum becomes a day of compute, not years.
  --mode sync   : sequential Messages API calls (good for small runs / testing).
  --mock        : offline deterministic stubs (no API key needed).

Output: build/notes_draft.jsonl  (one JSON object per line)
"""
import argparse
import json
import os

import config
import prompts
import llm
import schema


def load_objectives():
    with open(config.OBJECTIVES, encoding="utf-8") as f:
        return json.load(f)


def build_request(o):
    return {
        "custom_id": o["id"][:64],
        "system": prompts.gen_system(o["board"], o["subject"], o["curriculum"]),
        "user": prompts.gen_user(o["spec_ref"], o["objective"]),
    }


def record(o, raw):
    try:
        note = schema.coerce_note(llm.parse_json(raw))
        ok, problems = schema.validate_note(note)
    except Exception as e:
        note, ok, problems = None, False, [f"parse error: {e}"]
    return {**o, "note": note, "valid": ok, "schema_problems": problems,
            "generated_by": config.GEN_MODEL}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["batch", "sync"], default="batch")
    ap.add_argument("--mock", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="cap objectives (testing)")
    a = ap.parse_args()

    objs = load_objectives()
    if a.limit:
        objs = objs[:a.limit]
    by_id = {o["id"][:64]: o for o in objs}

    results = {}
    if a.mock or a.mode == "sync":
        for o in objs:
            r = build_request(o)
            raw = llm.call(config.GEN_MODEL, r["system"], r["user"],
                           max_tokens=config.MAX_TOKENS, mock=a.mock, mock_fn=llm.mock_note)
            results[r["custom_id"]] = raw
            print(f"  generated {o['spec_ref']}  {o['subject']}")
    else:
        reqs = [build_request(o) for o in objs]
        bid = llm.batch_submit(reqs, config.GEN_MODEL, config.MAX_TOKENS)
        print(f"  submitted batch {bid} ({len(reqs)} requests) — polling…")
        for cid, raw in llm.batch_collect(bid):
            results[cid] = raw

    os.makedirs(config.BUILD, exist_ok=True)
    n = 0
    with open(config.DRAFTS, "w", encoding="utf-8") as f:
        for cid, o in by_id.items():
            raw = results.get(cid)
            if raw is None:
                f.write(json.dumps({**o, "note": None, "valid": False,
                                    "schema_problems": ["no model output"]}) + "\n")
                continue
            f.write(json.dumps(record(o, raw), ensure_ascii=False) + "\n")
            n += 1
    print(f"generate: wrote {n} drafts -> {config.DRAFTS}")


if __name__ == "__main__":
    main()
