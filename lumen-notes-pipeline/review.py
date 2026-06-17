"""Stage 4 — REVIEW + EXPORT.

Produces two things:
  * build/review_queue.html — a standalone reviewer tool. Flagged notes float to
    the top. A human approves, flags, or edits each note (reviewing/correcting a
    draft is several times faster than writing from scratch), then clicks
    "Download approved pack" to export the human-signed-off content.
  * build/pack.json — the auto-approved pack (critic passes) in the exact format
    the Lumen app imports. Use this to seed the app immediately; replace it with
    the reviewer's downloaded pack once humans have signed off.

Prioritise reviewing the high-traffic core (popular boards/subjects) and the
error-prone material (formulae, dates, mark-scheme phrasing); let the long tail
stay AI-generated + self-checked in-app until it earns a human pass.
"""
import json
import os
import config


def build_pack(records, only_approved=True):
    items = []
    for r in records:
        if only_approved and r.get("status") != "approved":
            continue
        if not r.get("note"):
            continue
        items.append({
            "curriculum": r["curriculum"], "board": r["board"], "subject": r["subject"],
            "topic": r.get("topic", ""), "spec_ref": r.get("spec_ref", ""),
            "objective": r.get("objective", ""), "note": r["note"], "status": "approved",
        })
    return {"generated_with": config.GEN_MODEL, "verified_with": config.CRITIC_MODEL, "items": items}


def build_manifest(records):
    """The unified artifact: drives the app's topic tree AND supplies verified notes.

    subjects -> topic -> [ {spec_ref, objective, status, note?} ]
    Every objective defines structure; approved objectives also carry a verified note
    (the rest are generated on-demand + self-checked inside the app).
    """
    subjects, curriculum, board = {}, None, None
    for r in records:
        curriculum = r["curriculum"]
        board = r.get("board")
        subj = r["subject"]
        topic = r.get("topic") or "General"
        entry = {"spec_ref": r.get("spec_ref", ""), "objective": r.get("objective", ""),
                 "status": r.get("status", "flagged")}
        if r.get("status") == "approved" and r.get("note"):
            entry["note"] = r["note"]
        subjects.setdefault(subj, {}).setdefault(topic, []).append(entry)
    return {"curriculum": curriculum, "board": board, "subjects": subjects}


REVIEW_TEMPLATE = r"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lumen — Notes Review Queue</title>
<style>
 :root{--void:#060611;--surface:rgba(255,255,255,.04);--border:rgba(255,255,255,.1);--text:#ECEDF5;--muted:#9498B0;--gold:#FFC368;--ok:#43E0A6;--bad:#FF7A85}
 *{box-sizing:border-box;margin:0;padding:0}
 body{background:var(--void);color:var(--text);font-family:Inter,system-ui,sans-serif;line-height:1.6;padding:28px;max-width:920px;margin:0 auto}
 h1{font-family:Georgia,serif;font-weight:500;font-size:28px;margin-bottom:4px}
 .sub{color:var(--muted);margin-bottom:8px;font-size:14px}
 .bar{position:sticky;top:0;background:rgba(6,6,17,.92);backdrop-filter:blur(8px);padding:14px 0;margin-bottom:18px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--border);z-index:5}
 .stat{font-family:ui-monospace,monospace;font-size:12px;color:var(--muted);padding:6px 12px;border:1px solid var(--border);border-radius:99px}
 .stat b{color:var(--text)}
 button{font-family:inherit;cursor:pointer}
 .dl{margin-left:auto;background:linear-gradient(180deg,#FFE6AE,#FFB347);color:#2a1e05;border:none;border-radius:99px;padding:10px 18px;font-weight:600}
 .card{border:1px solid var(--border);border-radius:14px;background:var(--surface);padding:20px;margin-bottom:14px}
 .card.flagged{border-color:rgba(255,122,133,.45)}
 .card.approved{border-color:rgba(67,224,166,.35)}
 .meta{font-family:ui-monospace,monospace;font-size:12px;color:var(--muted);margin-bottom:6px}
 .obj{font-size:15px;margin-bottom:12px}.obj b{color:var(--gold)}
 .verdict{display:inline-block;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:99px;margin-bottom:12px}
 .verdict.pass{color:var(--ok);border:1px solid rgba(67,224,166,.4)}
 .verdict.revise{color:var(--bad);border:1px solid rgba(255,122,133,.4)}
 .flags{background:rgba(255,122,133,.08);border:1px solid rgba(255,122,133,.25);border-radius:10px;padding:12px 14px;margin:10px 0;font-size:13.5px}
 .flags h4{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--bad);margin-bottom:6px}
 .flags li{margin-left:18px}
 .note h3{font-family:Georgia,serif;font-size:17px;margin:12px 0 6px}
 .note li{margin-left:20px;color:var(--muted);font-size:14px}
 .note .summary{font-style:italic;color:var(--text);margin-bottom:8px}
 details{margin-top:10px}summary{cursor:pointer;font-size:13px;color:var(--muted)}
 textarea{width:100%;min-height:160px;background:#0b0b18;color:var(--text);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:ui-monospace,monospace;font-size:12px;margin-top:8px}
 .actions{display:flex;gap:8px;margin-top:12px}
 .act{border:1px solid var(--border);background:none;color:var(--text);border-radius:8px;padding:8px 14px;font-size:13px}
 .act.on-ok{background:rgba(67,224,166,.15);border-color:var(--ok);color:var(--ok)}
 .act.on-bad{background:rgba(255,122,133,.12);border-color:var(--bad);color:var(--bad)}
</style></head><body>
<h1>Notes Review Queue</h1>
<div class="sub">Flagged items first. Approve, flag, or edit each note, then download the human-approved pack for the app.</div>
<div class="bar">
  <span class="stat">Total <b id="t">0</b></span>
  <span class="stat">Approved <b id="a" style="color:#43E0A6">0</b></span>
  <span class="stat">Flagged <b id="fl" style="color:#FF7A85">0</b></span>
  <button class="dl" onclick="download_()">⬇ Download approved pack</button>
</div>
<div id="list"></div>
<script id="data" type="application/json">__DATA__</script>
<script>
 var DATA = JSON.parse(document.getElementById('data').textContent);
 // flagged first
 DATA.sort(function(a,b){ return (a.status==='approved') - (b.status==='approved'); });
 var list = document.getElementById('list');
 function esc(s){ return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];}); }
 function noteHTML(n){
   if(!n) return '<i>(no note)</i>';
   var h='<div class="summary">'+esc(n.summary||'')+'</div>';
   (n.sections||[]).forEach(function(s){ h+='<h3>'+esc(s.heading||'')+'</h3><ul>'; (s.points||[]).forEach(function(p){h+='<li>'+esc(p)+'</li>';}); h+='</ul>'; });
   if((n.keyTerms||[]).length){ h+='<h3>Key terms</h3><ul>'; n.keyTerms.forEach(function(t){h+='<li><b>'+esc(t.term)+'</b> — '+esc(t.definition)+'</li>';}); h+='</ul>'; }
   if((n.examTips||[]).length){ h+='<h3>Exam tips</h3><ul>'; n.examTips.forEach(function(t){h+='<li>'+esc(t)+'</li>';}); h+='</ul>'; }
   return h;
 }
 function render(){
   list.innerHTML='';
   DATA.forEach(function(r,i){
     var c=r.check||{}; var flags=[].concat(c.accuracy_flags||[],c.contradictions||[],c.missing||[]);
     var card=document.createElement('div'); card.className='card '+(r.status==='approved'?'approved':'flagged');
     card.innerHTML =
       '<div class="meta">'+esc(r.curriculum)+' · '+esc(r.board)+' · '+esc(r.subject)+'  ['+esc(r.spec_ref)+']</div>'+
       '<div class="obj"><b>Objective:</b> '+esc(r.objective)+'</div>'+
       '<span class="verdict '+(c.verdict==='pass'?'pass':'revise')+'">'+esc(c.verdict||'revise')+'</span>'+
       (flags.length?'<div class="flags"><h4>Reviewer flags</h4><ul>'+flags.map(function(f){return '<li>'+esc(f)+'</li>';}).join('')+'</ul></div>':'')+
       '<div class="note">'+noteHTML(r.note)+'</div>'+
       '<details><summary>Edit note JSON</summary><textarea data-i="'+i+'">'+esc(JSON.stringify(r.note,null,2))+'</textarea></details>'+
       '<div class="actions">'+
         '<button class="act '+(r.status==='approved'?'on-ok':'')+'" onclick="setStatus('+i+',\'approved\')">Approve</button>'+
         '<button class="act '+(r.status==='flagged'?'on-bad':'')+'" onclick="setStatus('+i+',\'flagged\')">Flag</button>'+
         '<button class="act" onclick="saveEdit('+i+')">Save edit</button>'+
       '</div>';
     list.appendChild(card);
   });
   document.getElementById('t').textContent=DATA.length;
   document.getElementById('a').textContent=DATA.filter(function(r){return r.status==='approved';}).length;
   document.getElementById('fl').textContent=DATA.filter(function(r){return r.status!=='approved';}).length;
 }
 function setStatus(i,s){ DATA[i].status=s; render(); }
 function saveEdit(i){
   var ta=document.querySelector('textarea[data-i="'+i+'"]');
   try{ DATA[i].note=JSON.parse(ta.value); alert('Saved. Mark it Approved when ready.'); }
   catch(e){ alert('Invalid JSON: '+e.message); }
 }
 function download_(){
   var items=DATA.filter(function(r){return r.status==='approved' && r.note;}).map(function(r){
     return {curriculum:r.curriculum,board:r.board,subject:r.subject,topic:r.topic,spec_ref:r.spec_ref,objective:r.objective,note:r.note,status:'approved'};
   });
   var blob=new Blob([JSON.stringify({items:items},null,2)],{type:'application/json'});
   var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='pack.json'; a.click();
 }
 render();
</script></body></html>"""


def main():
    records = []
    with open(config.CHECKED, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    os.makedirs(config.BUILD, exist_ok=True)
    pack = build_pack(records, only_approved=True)
    with open(config.PACK, "w", encoding="utf-8") as f:
        json.dump(pack, f, indent=2, ensure_ascii=False)

    manifest = build_manifest(records)
    with open(config.MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    html = REVIEW_TEMPLATE.replace("__DATA__", json.dumps(records, ensure_ascii=False))
    with open(config.REVIEW_HTML, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"review: {len(pack['items'])} approved -> {config.PACK}")
    print(f"review: unified manifest -> {config.MANIFEST}")
    print(f"review: queue UI -> {config.REVIEW_HTML}")


if __name__ == "__main__":
    main()
