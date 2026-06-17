"""Progress tracker — coverage across everything drafted so far.

    python status.py
"""
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(ROOT, "build")


def main():
    if not os.path.isdir(BASE):
        print("nothing drafted yet — run build_all.py first")
        return

    rows = []
    for cur in sorted(os.listdir(BASE)):
        curdir = os.path.join(BASE, cur)
        if not os.path.isdir(curdir):
            continue
        for subj in sorted(os.listdir(curdir)):
            checked = os.path.join(curdir, subj, "notes_checked.jsonl")
            if not os.path.exists(checked):
                continue
            total = approved = flagged = 0
            for line in open(checked, encoding="utf-8"):
                line = line.strip()
                if not line:
                    continue
                total += 1
                if json.loads(line).get("status") == "approved":
                    approved += 1
                else:
                    flagged += 1
            rows.append((cur, subj, total, approved, flagged))

    if not rows:
        print("nothing drafted yet — run build_all.py first")
        return

    print(f"{'curriculum':<11}{'subject':<20}{'objs':>5}{'appr':>6}{'flag':>6}{'verified':>10}")
    print("-" * 58)
    tt = ta = tf = 0
    for cur, subj, total, ap_, fl_ in rows:
        pct = f"{(ap_ / total * 100):.0f}%" if total else "—"
        print(f"{cur:<11}{subj:<20}{total:>5}{ap_:>6}{fl_:>6}{pct:>10}")
        tt += total
        ta += ap_
        tf += fl_
    print("-" * 58)
    overall = f"{(ta / tt * 100):.0f}%" if tt else "—"
    print(f"{'TOTAL':<31}{tt:>5}{ta:>6}{tf:>6}{overall:>10}")
    print(f"\n{ta} verified / {tt} drafted · {tf} awaiting review")


if __name__ == "__main__":
    main()
