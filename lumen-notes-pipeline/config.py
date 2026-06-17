"""Central configuration for the Lumen notes pipeline.

Everything the pipeline produces conforms to NOTE_SCHEMA, which is the exact
shape the Lumen Study app renders. Keep these in sync.
"""
import os

# ---- models -------------------------------------------------------------
# Use a strong model to WRITE and a (different) strong model to CHECK.
# Using two different families for generate vs verify gives a real
# cross-check rather than a model grading its own homework.
GEN_MODEL    = os.environ.get("LUMEN_GEN_MODEL",    "claude-opus-4-8")
CRITIC_MODEL = os.environ.get("LUMEN_CRITIC_MODEL", "claude-sonnet-4-6")
INGEST_MODEL = os.environ.get("LUMEN_INGEST_MODEL", "claude-sonnet-4-6")

MAX_TOKENS = 1200

# ---- paths --------------------------------------------------------------
ROOT      = os.path.dirname(os.path.abspath(__file__))
BUILD     = os.environ.get("LUMEN_BUILD", os.path.join(ROOT, "build"))
OBJECTIVES = os.path.join(BUILD, "objectives.json")
DRAFTS     = os.path.join(BUILD, "notes_draft.jsonl")
CHECKED    = os.path.join(BUILD, "notes_checked.jsonl")
REVIEW_HTML = os.path.join(BUILD, "review_queue.html")
PACK       = os.path.join(BUILD, "pack.json")
MANIFEST   = os.path.join(BUILD, "manifest.json")

# ---- the note schema (must match the app's renderNotes) -----------------
# {
#   "summary":  str,
#   "sections": [{"heading": str, "points": [str, ...]}],
#   "keyTerms": [{"term": str, "definition": str}],
#   "examTips": [str, ...]
# }
NOTE_SCHEMA_DESCRIPTION = (
    '{"summary": "1-2 sentence overview", '
    '"sections": [{"heading": "string", "points": ["string", ...]}], '
    '"keyTerms": [{"term": "string", "definition": "string"}], '
    '"examTips": ["string", ...]}'
)
