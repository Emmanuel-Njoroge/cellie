/* ================= REPORT HELPERS (shared by the student and teacher views) ================= */
const ACT={};   // button actions for newer screens: data-act="name" -> ACT.name(button, dataset, event)
const fmtDur=sec=>{sec=Math.round(sec||0);if(sec<60)return sec+' sec';const m=Math.round(sec/60);return m<60?m+' min':Math.floor(m/60)+' hr '+pad(m%60)+' min'};
const fmtMin=sec=>{const m=(sec||0)/60;return m<10?m.toFixed(1):Math.round(m)};
const pctOf=(c,t)=>t?Math.round(c/t*100):null;
const lastDays=n=>{const out=[];for(let i=n-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);out.push(dkey(d))}return out};
const dayLabel=d=>['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(d+'T12:00:00').getDay()];
function parseItemId(id){
  let m=/^([a-z]+)-([bix])-([123])$/.exec(id);if(m)return{kind:m[3]==='3'?'challenge':'lesson',unit:m[1],level:m[2],n:+m[3]};
  m=/^book-([a-z]+)-([bix])$/.exec(id);if(m)return{kind:'chapter',unit:m[1],level:m[2]};
  m=/^vid-([a-z]+)-([bix])$/.exec(id);if(m)return{kind:'video',unit:m[1],level:m[2]};
  return null;
}
function itemTitle(id){
  const p=parseItemId(id),u=p&&UNITS.find(x=>x.id===p.unit);if(!u)return id;
  if(p.kind==='chapter')return '📖 '+u.book[p.level].short;
  if(p.kind==='video')return '🎬 '+u.book[p.level].short;
  const l=lessonsFor(u,p.level)[p.n-1];return (p.kind==='challenge'?'⚡ ':'')+(l?l.title:id);
}
function questionText(id,qi){
  const p=parseItemId(id),u=p&&UNITS.find(x=>x.id===p.unit),l=u&&lessonsFor(u,p.level)[p.n-1],q=l&&l.qs[qi];
  return q?q.q:'Question '+(qi+1);
}
// Responsive bar chart (HTML + CSS). rows: [{label, v (minutes), tip}]
function barsSVG(rows){
  const mx=Math.max(...rows.map(r=>r.v),0.0001),fmt=v=>v>=10?Math.round(v):(Math.round(v*10)/10);
  return `<div class="bars" role="img" aria-label="Minutes per day: ${esc(rows.filter(r=>r.v>0).map(r=>(r.tip||r.label)+' '+fmt(r.v)+' min').join(', ')||'no activity yet')}">${rows.map(r=>`<div class="bcol" title="${esc((r.tip||r.label)+': '+fmt(r.v)+' min')}"><span class="bval">${r.v>0?fmt(r.v):''}</span><div class="btrack"><i style="height:${r.v>0?Math.max(4,Math.round(r.v/mx*100)):0}%"></i></div><span class="blab">${esc(r.label)}</span></div>`).join('')}</div>`;
}
const topicBars=rows=>UNITS.map(u=>{const r=(rows||[]).find(x=>x.unit_id===u.id),p=r?pctOf(r.correct,r.total):null;return `<div class="hbar" style="--uc:${u.color}"><span>${u.icon} ${esc(u.title)}</span><div class="t"><i style="width:${p||0}%"></i></div><em>${p===null?'-':p+'%'}</em></div>`}).join('');
function levelBars(items){
  const done=items.filter(i=>i.completed);
  return LVK.map(k=>{const n=done.filter(i=>i.level===k).length,tot=seqFor(k).filter(x=>x.kind!=='sticker').length;return `<div class="hbar" style="--uc:var(--accent)"><span>${LV[k].icon} ${LV[k].name}</span><div class="t"><i style="width:${Math.round(n/tot*100)}%"></i></div><em>${n}/${tot}</em></div>`}).join('');
}
