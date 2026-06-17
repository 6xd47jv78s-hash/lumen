"""Stage 1 — INGEST: specification -> structured objectives.

Inputs supported:
  * .md / .txt with lines:  spec_ref | topic | objective
  * .csv  with columns:     spec_ref, topic, objective   (or subject too)
  * .pdf                    (extracts text, then uses an LLM to structure it)

Working from the official spec is the single biggest accuracy lever: you generate
one note per real objective, so you can't miss a topic and the model can't drift.
Every board publishes its full spec free (AQA, Edexcel/Pearson, OCR, Cambridge,
the IBO subject guides, College Board AP CEDs) — feed those in here.

Output: build/objectives.json  -> [{subject, topic, spec_ref, objective}, ...]
"""
import argparse
import csv
import json
import os

import config
import prompts
import llm


def from_pipe(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 3:
                rows.append({"spec_ref": parts[0], "topic": parts[1], "objective": parts[2]})
    return rows


def from_csv(path):
    rows = []
    with open(path, encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            rows.append({"spec_ref": r.get("spec_ref", ""), "topic": r.get("topic", ""),
                         "objective": r.get("objective", ""), "subject": r.get("subject", "")})
    return rows


def from_pdf(path, subject, mock=False):
    import pdfplumber  # pip install pdfplumber
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"
    # chunk to keep requests sane; structure each chunk with the model
    chunks = [text[i:i + 6000] for i in range(0, len(text), 6000)]
    objectives = []
    for ch in chunks:
        out = llm.call(config.INGEST_MODEL, prompts.ingest_system(), prompts.ingest_user(subject, ch),
                       mock=mock, mock_fn=lambda s, u: '{"objectives": []}')
        try:
            objectives.extend(llm.parse_json(out).get("objectives", []))
        except Exception:
            pass
    return objectives


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="spec file (.md/.txt/.csv/.pdf)")
    ap.add_argument("--curriculum", required=True)
    ap.add_argument("--board", required=True)
    ap.add_argument("--subject", required=True)
    ap.add_argument("--mock", action="store_true")
    a = ap.parse_args()

    ext = os.path.splitext(a.input)[1].lower()
    if ext in (".md", ".txt"):
        rows = from_pipe(a.input)
    elif ext == ".csv":
        rows = from_csv(a.input)
    elif ext == ".pdf":
        rows = from_pdf(a.input, a.subject, mock=a.mock)
    else:
        raise SystemExit(f"unsupported input type: {ext}")

    objectives = []
    for i, r in enumerate(rows):
        objectives.append({
            "id": f"{a.curriculum}|{a.subject}|{r.get('spec_ref') or i}".replace(" ", "_"),
            "curriculum": a.curriculum, "board": a.board,
            "subject": r.get("subject") or a.subject,
            "topic": r.get("topic", ""), "spec_ref": r.get("spec_ref", str(i)),
            "objective": r["objective"],
        })

    os.makedirs(config.BUILD, exist_ok=True)
    with open(config.OBJECTIVES, "w", encoding="utf-8") as f:
        json.dump(objectives, f, indent=2, ensure_ascii=False)
    print(f"ingest: wrote {len(objectives)} objectives -> {config.OBJECTIVES}")


if __name__ == "__main__":
    main()
