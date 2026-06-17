"""Prompts are the accuracy contract. Generation is told to cover EXACTLY the
spec objective and to omit rather than guess; the critic grades the result
against that same objective. Both return strict JSON.
"""
from config import NOTE_SCHEMA_DESCRIPTION


def gen_system(board, subject, curriculum):
    return (
        f"You write revision notes for {board} {subject} ({curriculum}). "
        "You are precise, exam-focused and factually careful. "
        "You write original notes in your own words and never copy text from any source."
    )


def gen_user(spec_ref, objective):
    return (
        f"Write revision notes that cover EXACTLY this specification objective and nothing outside it:\n"
        f"[{spec_ref}] {objective}\n\n"
        "Rules:\n"
        "- Stay strictly within this objective. Do not drift into adjacent topics.\n"
        "- Match the command word in the objective: 'describe' needs the what; 'explain' needs the why "
        "(reasoning/mechanism); 'calculate' needs the method.\n"
        "- For any calculation, state the equation, then give one fully worked example WITH correct units.\n"
        "- Write at the level and assessment tier of this qualification.\n"
        "- Be factually accurate. If unsure of a fact, OMIT it rather than guess. Do NOT invent specific "
        "figures, dates, constants or names — only include values you are confident are correct.\n"
        "- Define every key term precisely. Use correct subject terminology and the phrasing examiners reward.\n"
        "- Each point should be self-contained and revisable on its own.\n"
        "- Original wording only; do not reproduce textbook or website text.\n\n"
        f"Respond with ONLY valid JSON (no markdown, no backticks) in exactly this shape:\n{NOTE_SCHEMA_DESCRIPTION}\n"
        "3-4 sections, 3-5 points each, 2-4 key terms, 2-3 exam tips. Plain text only."
    )


def critic_system(subject):
    return (
        f"You are a meticulous {subject} examiner and fact-checker. You review AI-generated "
        "revision notes against the single specification objective they are meant to cover. "
        "You are strict: you flag anything inaccurate, out of scope, or missing."
    )


def critic_user(spec_ref, objective, note_json):
    return (
        f"Specification objective:\n[{spec_ref}] {objective}\n\n"
        f"Notes under review (JSON):\n{note_json}\n\n"
        "Assess the notes. Re-derive any arithmetic yourself, check units and that any quoted "
        "figures/dates/constants/formulae are correct, and confirm the depth matches the objective's "
        "command word. Respond with ONLY valid JSON (no markdown):\n"
        '{"coverage": true/false,                      // do the notes fully address the objective?\n'
        ' "scope_ok": true/false,                       // do they stay within the objective (no drift)?\n'
        ' "accuracy_flags": ["specific statement that is wrong or needs verifying (incl. bad maths/units)", ...],\n'
        ' "contradictions": ["...", ...],\n'
        ' "missing": ["required point not covered", ...],\n'
        ' "verdict": "pass" or "revise",               // pass only if coverage AND scope_ok AND no accuracy_flags\n'
        ' "fix_instructions": "concise instructions to fix, or empty string"}'
    )


def ingest_system():
    return (
        "You convert exam-board specification text into a clean list of discrete, "
        "assessable learning objectives. You preserve the board's reference codes."
    )


def ingest_user(subject, spec_text):
    return (
        f"Subject: {subject}\n\nSpecification text:\n{spec_text}\n\n"
        "Extract every discrete assessable learning objective. Respond with ONLY valid JSON (no markdown):\n"
        '{"objectives": [{"topic": "string", "spec_ref": "string", "objective": "string"}, ...]}\n'
        "One entry per objective. Keep the original reference codes. Do not invent objectives."
    )
