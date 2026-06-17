"""One-command orchestrator: ingest -> generate -> verify -> review.

Examples
--------
# Offline demo (no API key needed) on the bundled sample slice:
python run.py --input sample_spec.md --curriculum GCSE --board AQA --subject "Biology" --mock

# Real run on one subject, cheap bulk generation via the Batch API:
ANTHROPIC_API_KEY=sk-... python run.py \
    --input specs/aqa_gcse_biology.pdf --curriculum GCSE --board AQA --subject "Biology"

Then open build/review_queue.html, sign off the notes, download pack.json,
and import it into the Lumen app ("Import verified notes").
"""
import argparse
import subprocess
import sys


def run(cmd):
    print("\n$ " + " ".join(cmd))
    r = subprocess.run([sys.executable] + cmd)
    if r.returncode != 0:
        raise SystemExit(f"stage failed: {cmd}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--curriculum", required=True)
    ap.add_argument("--board", required=True)
    ap.add_argument("--subject", required=True)
    ap.add_argument("--mode", choices=["batch", "sync"], default="batch")
    ap.add_argument("--mock", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    a = ap.parse_args()

    mock = ["--mock"] if a.mock else []
    run(["ingest.py", "--input", a.input, "--curriculum", a.curriculum,
         "--board", a.board, "--subject", a.subject] + mock)
    gen = ["generate.py", "--mode", a.mode] + mock
    if a.limit:
        gen += ["--limit", str(a.limit)]
    run(gen)
    run(["verify.py"] + mock)
    run(["review.py"])
    print("\nDone. Open build/review_queue.html, then import build/manifest.json into the app.")


if __name__ == "__main__":
    main()
