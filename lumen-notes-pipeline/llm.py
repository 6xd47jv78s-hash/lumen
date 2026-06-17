"""Thin LLM layer.

Three call paths:
  - call()          : single synchronous Messages API call (used by ingest/verify/sync-generate)
  - batch_submit()/batch_collect() : Anthropic Message Batches API for cheap bulk generation
  - mock mode       : deterministic, dependency-free stubs so the whole pipeline runs offline

Set ANTHROPIC_API_KEY in your environment for real calls. Pass mock=True anywhere to stub.
"""
import json
import re
import time

_client = None


def _get_client():
    global _client
    if _client is None:
        from anthropic import Anthropic  # imported lazily so mock mode needs no install
        _client = Anthropic()
    return _client


def extract_text(message):
    return "".join(b.text for b in message.content if getattr(b, "type", "") == "text")


def parse_json(text):
    """Strip fences and parse the first JSON object/array in the text."""
    t = re.sub(r"```json", "", text, flags=re.I).replace("```", "").strip()
    s, a = t.find("{"), t.find("[")
    start = a if (a != -1 and (a < s or s == -1)) else s
    end = max(t.rfind("}"), t.rfind("]"))
    if start != -1 and end != -1:
        t = t[start:end + 1]
    return json.loads(t)


# --------------------------------------------------------------------------
# synchronous single call
# --------------------------------------------------------------------------
def call(model, system, user, max_tokens=1200, mock=False, mock_fn=None):
    if mock:
        return mock_fn(system, user) if mock_fn else "{}"
    msg = _get_client().messages.create(
        model=model, max_tokens=max_tokens, system=system,
        messages=[{"role": "user", "content": user}],
    )
    return extract_text(msg)


# --------------------------------------------------------------------------
# batch API  (≈50% cheaper, returns within ~24h; ideal for the whole curriculum)
# --------------------------------------------------------------------------
def batch_submit(requests, model, max_tokens=1200):
    """requests: list of {"custom_id": str, "system": str, "user": str}."""
    from anthropic.types.messages.batch_create_params import Request
    from anthropic.types.message_create_params import MessageCreateParamsNonStreaming

    items = [
        Request(
            custom_id=r["custom_id"],
            params=MessageCreateParamsNonStreaming(
                model=model, max_tokens=max_tokens, system=r["system"],
                messages=[{"role": "user", "content": r["user"]}],
            ),
        )
        for r in requests
    ]
    batch = _get_client().messages.batches.create(requests=items)
    return batch.id


def batch_collect(batch_id, poll_seconds=30):
    """Block until the batch finishes, then yield (custom_id, text)."""
    client = _get_client()
    while True:
        b = client.messages.batches.retrieve(batch_id)
        if b.processing_status == "ended":
            break
        time.sleep(poll_seconds)
    for result in client.messages.batches.results(batch_id):
        cid = result.custom_id
        if result.result.type == "succeeded":
            yield cid, extract_text(result.result.message)
        else:
            yield cid, None  # errored / expired / cancelled


# --------------------------------------------------------------------------
# deterministic mocks (offline demonstration only)
# --------------------------------------------------------------------------
def mock_note(system, user):
    m = re.search(r"\[(.*?)\]\s*(.+)", user)
    ref = m.group(1) if m else "ref"
    obj = (m.group(2).split("\n")[0] if m else "the objective").strip()
    short = obj[:70]
    # one "good" stub and one deliberately thin stub (every 4th) so the critic flags some
    thin = (sum(ord(c) for c in ref) % 4 == 0)
    note = {
        "summary": f"Notes covering [{ref}]: {short}.",
        "sections": ([{"heading": "Key idea", "points": [f"Core point for: {short}", "Supporting detail."]}]
                     if thin else
                     [{"heading": "Key idea", "points": [f"Core point for: {short}", "Supporting detail.", "A worked relationship or example."]},
                      {"heading": "How it is assessed", "points": ["What examiners ask for here.", "A common command word and what it expects."]},
                      {"heading": "Common pitfalls", "points": ["A frequent mistake students make.", "How to avoid it."]}]),
        "keyTerms": [{"term": "Term A", "definition": "Definition tied to the objective."},
                     {"term": "Term B", "definition": "Second relevant definition."}],
        "examTips": ["State definitions precisely.", "Link each point back to the objective."],
    }
    return json.dumps(note)


def mock_critic(system, user):
    # flag the thin notes (few sections) as 'revise'
    n_sections = user.count('"heading"')
    if n_sections <= 1:
        return json.dumps({
            "coverage": False, "scope_ok": True,
            "accuracy_flags": [], "contradictions": [],
            "missing": ["Objective only partially developed; add assessment and pitfalls."],
            "verdict": "revise",
            "fix_instructions": "Expand coverage to fully address the objective."})
    return json.dumps({
        "coverage": True, "scope_ok": True,
        "accuracy_flags": [], "contradictions": [], "missing": [],
        "verdict": "pass", "fix_instructions": ""})
