/* ----- Grown-ups ----- */
function grownHTML(){
  if(!gate){newGate();meView='home';return meHTML()}
  const arr=allFor(S.level);
  let c=0,t=0;Object.values(S.stats).forEach(s=>{c+=s.c;t+=s.t});
  const acc=t?Math.round(c/t*100):null;
  const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push({v:S.days[dkey(d)]||0,l:['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()]})}
  const mx=Math.max(goalPts(),...days.map(d=>d.v));
  const svg=`<svg viewBox="0 0 308 140" role="img" aria-label="Points earned in the last 7 days" style="width:100%;height:auto;font-family:inherit"><line x1="0" y1="108" x2="308" y2="108" stroke="var(--line)" stroke-width="2"/>${days.map((d,i)=>{const hh=Math.round(d.v/mx*92),x=i*44+8;return `<rect x="${x}" y="${108-Math.max(hh,3)}" width="28" height="${Math.max(hh,3)}" rx="6" fill="${d.v?'var(--accent)':'var(--line)'}"/>${d.v?`<text x="${x+14}" y="${102-hh}" text-anchor="middle" font-size="12" fill="var(--sub)">${d.v}</text>`:''}<text x="${x+14}" y="128" text-anchor="middle" font-size="12" fill="var(--sub)">${d.l}</text>`}).join('')}</svg>`;
  const topics=UNITS.map(u=>{const s=S.stats[u.id],p=s&&s.t?Math.round(s.c/s.t*100):null;return `<div class="hbar" style="--uc:${u.color}"><span>${u.icon} ${esc(u.title)}</span><div class="t"><i style="width:${p||0}%"></i></div><em>${p===null?'new':p+'%'}</em></div>`}).join('');
  const rev=[];LVK.forEach(k=>allFor(k).forEach(x=>{const d=S.done[x.l.id];if(d&&d.acc<.8)rev.push(Object.assign({k},x))}));
  const lvProg=LVK.map(k=>{const a=allFor(k),n=a.filter(x=>isDone(x.l)).length;return `<div class="hbar" style="--uc:var(--accent)"><span>${LV[k].icon} ${LV[k].name}</span><div class="t"><i style="width:${Math.round(n/a.length*100)}%"></i></div><em>${n}/${a.length}</em></div>`}).join('');
  const wkAcc=S.week.k===weekKey()&&S.week.t?Math.round(S.week.c/S.week.t*100)+'%':'-';
  return `<div class="row" style="justify-content:space-between;align-items:center"><h1 class="pt" style="margin:22px 0 4px">${esc(S.nick)}'s progress</h1><button class="btn ghost sm" data-act="lockGrown">Back</button></div><p class="sub">Progress is saved ${session==='cloud'&&!cloudBlocked?'to the account':'on this device'}. Leaderboards show only the animal name.</p>
  <div class="kpis"><div class="kpi"><small>Lessons done (all levels)</small><b>${LVK.reduce((n,k)=>n+allFor(k).filter(x=>isDone(x.l)).length,0)} / ${arr.length*3}</b></div><div class="kpi"><small>First-try accuracy</small><b>${acc===null?'-':acc+'%'}</b></div><div class="kpi"><small>Total points</small><b>${total()}</b></div><div class="kpi"><small>Time in app (this device)</small><b>${fmtDur(S.time.total)}</b></div><div class="kpi"><small>Time this week</small><b>${fmtDur(timeThisWeek())}</b></div><div class="kpi"><small>Accuracy this week</small><b>${wkAcc}</b></div><div class="kpi"><small>Chapters read</small><b>${Object.keys(S.cur).filter(k=>k.startsWith('book-')).length} / ${UNITS.length*3}</b></div><div class="kpi"><small>Videos watched</small><b>${Object.keys(S.cur).filter(k=>k.startsWith('vid-')).length} / ${UNITS.length*3}</b></div></div>
  <div class="card"><h3>Points in the last 7 days</h3>${svg}</div>
  <div class="card"><h3>Progress by level</h3>${lvProg}</div>
  <div class="card"><h3>How each topic is going</h3>${topics}</div>
  <div class="card"><h3>Worth another look</h3>${rev.length?rev.slice(0,8).map(x=>`<div class="rev"><span>${x.u.icon} ${esc(x.l.title)} <small style="color:var(--sub)">(${LV[x.k].name}, ${Math.round(S.done[x.l.id].acc*100)}%)</small></span><button class="btn sm" data-act="practice" data-k="${x.k}" data-u="${x.ui}" data-l="${x.li}">Practice</button></div>`).join(''):'<p class="sub" style="margin:0">Nothing to review right now. Great work!</p>'}</div>
  <div class="card"><h3>Where the facts come from</h3><p class="sub">Lessons were checked against several public sources, and numbers use ranges where scientists disagree. This is general education, not medical advice.</p><ul class="srcs">${SOURCES.map(s=>`<li><a href="${s[1]}" target="_blank" rel="noopener noreferrer">${esc(s[0])}</a></li>`).join('')}</ul></div>
  <div class="card"><h3>Privacy and reset</h3><p class="sub">Delete this explorer's progress${session==='cloud'?' and leaderboard entry':''}.</p><button class="btn bad sm" data-act="reset">Reset everything</button></div>`;
}
function newGate(){
  const a=6+Math.floor(Math.random()*4),b=6+Math.floor(Math.random()*4),r=a*b;
  const opts=shuffle([r,r+a,r-b,r+10]);
  modal(`<div class="sheet"><h2>Grown-ups only</h2><p>What is ${a} × ${b}?</p><div class="row">${opts.map(o=>`<button class="btn ghost" style="min-width:calc(50% - 5px)" data-act="gateAns" data-v="${o}" data-r="${r}">${o}</button>`).join('')}</div><button class="btn ghost wide" data-act="closeModal">Cancel</button></div>`);
}
