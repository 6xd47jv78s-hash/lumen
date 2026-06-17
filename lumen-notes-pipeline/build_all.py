"""Draft EVERY subject in subjects.config.json with one command.

Runs the full pipeline (ingest -> generate -> verify -> review) per subject, each into
its own build/<curriculum>/<subject>/ folder, then merges every subject of a curriculum
into one importable manifest. Resumable: already-drafted subjects are skipped unless --force.

Examples
--------
# Offline dry-run of the whole config (no API key):
python build_all.py --mock

# Real run, everything in the config:
ANTHROPIC_API_KEY=sk-... python build_all.py

# Just a couple of subjects, force re-draft:
python build_all.py --only "Biology,Chemistry" --force
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", str(s).lower()).strip("-")


def run_subject(entry, mode, mock, force):
    cur, board, subj, inp = entry["curriculum"], entry["board"], entry["subject"], entry["input"]
    outdir = os.path.join(ROOT, "build", slug(cur), slug(subj))
    manifest = os.path.join(outdir, "manifest.json")
    if os.path.exists(manifest) and not force:
        return outdir, "skipped"
    if not os.path.exists(os.path.join(ROOT, inp)):
        return outdir, "NO SPEC FILE"
    env = dict(os.environ)
    env["LUMEN_BUILD"] = outdir
    cmd = [sys.executable, os.path.join(ROOT, "run.py"), "--input", inp,
           "--curriculum", cur, "--board", board, "--subject", subj, "--mode", mode]
    if mock:
        cmd.append("--mock")
    r = subprocess.run(cmd, env=env, cwd=ROOT)
    return outdir, ("ok" if r.returncode == 0 else "FAILED")


def summarize(outdir):
    checked = os.path.join(outdir, "notes_checked.jsonl")
    approved = flagged = 0
    if os.path.exists(checked):
        for line in open(checked, encoding="utf-8"):
            line = line.strip()
            if not line:
                continue
            if json.loads(line).get("status") == "approved":
                approved += 1
            else:
                flagged += 1
    return approved, flagged


def merge_curriculum(cur, outdirs):
    merged = {"curriculum": cur, "board": None, "subjects": {}}
    for od in outdirs:
        mf = os.path.join(od, "manifest.json")
        if not os.path.exists(mf):
            continue
        m = json.load(open(mf, encoding="utf-8"))
        merged["board"] = merged["board"] or m.get("board")
        for subj, topics in (m.get("subjects") or {}).items():
            merged["subjects"].setdefault(subj, {}).update(topics)
    path = os.path.join(ROOT, "build", slug(cur) + "-manifest.json")
    json.dump(merged, open(path, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="subjects.config.json")
    ap.add_argument("--mock", action="store_true")
    ap.add_argument("--force", action="store_true", help="re-draft even if a manifest exists")
    ap.add_argument("--only", default="", help="comma-separated subjects to include")
    ap.add_argument("--skip", default="", help="comma-separated subjects to skip")
    ap.add_argument("--curriculum", default="", help="limit to one curriculum")
    a = ap.parse_args()

    cfg = json.load(open(os.path.join(ROOT, a.config), encoding="utf-8"))
    mode = (cfg.get("defaults") or {}).get("mode", "batch")
    only = {x.strip() for x in a.only.split(",") if x.strip()}
    skip = {x.strip() for x in a.skip.split(",") if x.strip()}
    entries = [e for e in cfg["subjects"]
               if (not only or e["subject"] in only)
               and e["subject"] not in skip
               and (not a.curriculum or e["curriculum"] == a.curriculum)]

    print(f"Drafting {len(entries)} subject(s){' [MOCK]' if a.mock else ''}\n")
    by_cur, rows = {}, []
    for e in entries:
        print(f"=== {e['curriculum']} · {e['subject']} ===")
        outdir, status = run_subject(e, mode, a.mock, a.force)
        approved, flagged = summarize(outdir)
        rows.append((e["curriculum"], e["subject"], status, approved, flagged))
        by_cur.setdefault(e["curriculum"], []).append(outdir)
        print()

    manifests = [merge_curriculum(cur, ods) for cur, ods in by_cur.items()]

    print("=" * 56)
    print(f"{'curriculum':<11}{'subject':<18}{'status':<12}{'appr':>5}{'flag':>5}")
    print("-" * 56)
    ta = tf = 0
    for c, s, st, ap_, fl_ in rows:
        print(f"{c:<11}{s:<18}{st:<12}{ap_:>5}{fl_:>5}")
        ta += ap_
        tf += fl_
    print("-" * 56)
    print(f"{'TOTAL':<41}{ta:>5}{tf:>5}")
    print("\nImport these into the app (one per curriculum):")
    for m in manifests:
        print("  " + m)
    print("\nReview flagged notes: build/<curriculum>/<subject>/review_queue.html")


if __name__ == "__main__":
    main()
