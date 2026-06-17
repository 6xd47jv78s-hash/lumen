"""Validation for generated notes so malformed model output never reaches the app."""


def validate_note(note):
    """Return (ok: bool, problems: list[str]) for a note dict."""
    problems = []
    if not isinstance(note, dict):
        return False, ["note is not an object"]

    if not isinstance(note.get("summary"), str) or not note["summary"].strip():
        problems.append("missing/empty summary")

    secs = note.get("sections")
    if not isinstance(secs, list) or not secs:
        problems.append("missing sections")
    else:
        for i, s in enumerate(secs):
            if not isinstance(s, dict):
                problems.append(f"section {i} not an object")
                continue
            if not isinstance(s.get("heading"), str) or not s["heading"].strip():
                problems.append(f"section {i} missing heading")
            pts = s.get("points")
            if not isinstance(pts, list) or not pts:
                problems.append(f"section {i} missing points")

    kt = note.get("keyTerms", [])
    if not isinstance(kt, list):
        problems.append("keyTerms not a list")
    else:
        for i, t in enumerate(kt):
            if not isinstance(t, dict) or "term" not in t or "definition" not in t:
                problems.append(f"keyTerm {i} malformed")

    et = note.get("examTips", [])
    if not isinstance(et, list):
        problems.append("examTips not a list")

    return (len(problems) == 0), problems


def coerce_note(note):
    """Best-effort normalisation so a slightly-off note still renders."""
    if not isinstance(note, dict):
        note = {}
    note.setdefault("summary", "")
    note.setdefault("sections", [])
    note.setdefault("keyTerms", [])
    note.setdefault("examTips", [])
    clean_sections = []
    for s in note["sections"]:
        if isinstance(s, dict):
            clean_sections.append({
                "heading": str(s.get("heading", "")).strip(),
                "points": [str(p) for p in s.get("points", []) if str(p).strip()],
            })
    note["sections"] = clean_sections
    note["keyTerms"] = [
        {"term": str(t.get("term", "")), "definition": str(t.get("definition", ""))}
        for t in note["keyTerms"] if isinstance(t, dict)
    ]
    note["examTips"] = [str(x) for x in note["examTips"] if str(x).strip()]
    return note
