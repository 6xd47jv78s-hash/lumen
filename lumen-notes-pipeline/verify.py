"""Stage 3 — VERIFY: automated critic pass (the real bottleneck, done cheaply).

A second model (different family from the generator) grades each note against the
SAME objective for coverage, scope, accuracy and contradictions. Notes that fail
become 'flagged' and rise to the top of the human review queue; passes are
'approved' but still reviewable. This is generate-and-check with two models, so a
single model never grades its own work.

Output: build/notes_checked.jsonl
"""
import argparse
import json
import os

import config
import prompts
import llm


def check_one(rec, mock=False):
    if not rec.get("note"):
        rec["check"] = {"verdict": "revise", "coverage": False, "scope_ok": False,
                        "accuracy_flags": [], "contradictions": [],
                        "missing": ["no note generated"], "fix_instructions": "regenerate"}
        rec["status"] = "flagged"
        return rec
    note_json = json.dumps(rec["note"], ensure_ascii=False)
    raw = llm.call(config.CRITIC_MODEL, prompts.critic_system(rec["subject"]),
                   prompts.critic_user(rec["spec_ref"], rec["objective"], note_json),
                   mock=mock, mock_fn=llm.mock_critic)
    try:
        check = llm.parse_json(raw)
    except Exception as e:
        check = {"verdict": "revise", "coverage": False, "scope_ok": False,
                 "accuracy_flags": [f"critic parse error: {e}"], "contradictions": [],
                 "missing": [], "fix_instructions": ""}
    # final status: pass only if critic says pass AND schema was valid
    passed = (check.get("verdict") == "pass") and rec.get("valid", True) \
        and not check.get("accuracy_flags") and not check.get("contradictions")
    rec["check"] = check
    rec["status"] = "approved" if passed else "flagged"
    rec["critic_model"] = config.CRITIC_MODEL
    return rec


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mock", action="store_true")
    a = ap.parse_args()

    out, approved, flagged = [], 0, 0
    with open(config.DRAFTS, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rec = check_one(json.loads(line), mock=a.mock)
            out.append(rec)
            if rec["status"] == "approved":
                approved += 1
            else:
                flagged += 1
            print(f"  {rec['status']:>8}  {rec['spec_ref']}  {rec['subject']}")

    os.makedirs(config.BUILD, exist_ok=True)
    with open(config.CHECKED, "w", encoding="utf-8") as f:
        for rec in out:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(f"verify: {approved} approved, {flagged} flagged -> {config.CHECKED}")


if __name__ == "__main__":
    main()
