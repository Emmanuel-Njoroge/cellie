/* ----- My progress (time in the app, lessons, accuracy) ----- */
let PG=null,PGerr='';
function openProgress(){meView='progress';tab='me';PG=null;PGerr='';render();window.scrollTo(0,0);loadProgress()}
async function loadProgress(){
  if(session!=='class'||!CLS)return;
  await flushOutbox();
  try{PG=await api('student/progress',{code:CLS.code,id:CLS.id,token:CLS.token,today:today(),weekStart:weekKey()})}
  catch(e){PGerr=netMsg(e)}
  if(meView==='progress'&&screen==='home')render();
}
// Same shape as the server report, built from this device (guests and Claude-account players).
function localProgress(){
  const days=Object.keys(S.time.days).sort().slice(-30).map(d=>({day:d,seconds:S.time.days[d],points:S.days[d]||0}));
  const topics=Object.keys(S.stats).map(k=>({unit_id:k,total:S.stats[k].t,correct:S.stats[k].c}));
  const items=[];
  Object.keys(S.done).forEach(id=>{const p=parseItemId(id);if(p)items.push({item_id:id,kind:p.kind,unit_id:p.unit,level:p.level,completed:true})});
  Object.keys(S.cur).forEach(id=>{const p=parseItemId(id);if(p)items.push({item_id:id,kind:p.kind,unit_id:p.unit,level:p.level,completed:true})});
  let c=0,t=0;topics.forEach(x=>{c+=x.correct;t+=x.total});
  return{totals:{seconds:S.time.total,todaySeconds:timeToday(),weekSeconds:timeThisWeek(),daysActive:Object.keys(S.time.days).length,points:S.pts,firstTryAnswers:t,firstTryCorrect:c},days,topics,items,
    recent:S.hist.slice(0,20).map(h=>({item_id:h.item,completed:h.done,points:h.pts,seconds:h.sec,accuracy:h.acc,total:h.total,at_ms:h.at,level:h.level})),badges:earned()};
}
function progressHTML(){
  const online=session==='class'&&CLS,P=online?PG:localProgress();
  let h=`<div class="row" style="justify-content:space-between;align-items:center"><h1 class="pt" style="margin:22px 0 4px">My progress</h1><button class="btn ghost sm" data-act="progressBack">Back</button></div><p class="sub">${online?'Saved in your class database, so you can see it on any device.':'Saved on this device only.'}</p>`;
  if(online&&!P)return h+(PGerr?`<div class="errbox">${esc(PGerr)}</div>`:`<div class="card"><p class="sub" style="margin:0">Loading your progress...</p></div>`);
  const T=P.totals,pts=T.points.b+T.points.i+T.points.x,acc=pctOf(T.firstTryCorrect,T.firstTryAnswers);
  const map={};P.days.forEach(d=>map[d.day]=d);
  const rows=lastDays(14).map(d=>({label:dayLabel(d),v:map[d]?map[d].seconds/60:0,tip:d+': '+fmtDur(map[d]?map[d].seconds:0)}));
  h+=`<div class="kpis"><div class="kpi"><small>Total time</small><b>${fmtDur(T.seconds)}</b></div><div class="kpi"><small>Today</small><b>${fmtDur(T.todaySeconds)}</b></div><div class="kpi"><small>This week</small><b>${fmtDur(T.weekSeconds)}</b></div><div class="kpi"><small>Days learning</small><b>${T.daysActive}</b></div><div class="kpi"><small>Points</small><b>⭐ ${pts}</b></div><div class="kpi"><small>First-try accuracy</small><b>${acc===null?'-':acc+'%'}</b></div></div>
  <div class="card"><h3>Minutes per day (last 14 days)</h3>${barsSVG(rows)}</div>
  <div class="card"><h3>Course progress</h3>${levelBars(P.items)}<p class="note">${P.items.filter(i=>i.completed).length} steps finished: chapters, videos, lessons and challenges.</p></div>
  <div class="card"><h3>Accuracy by topic</h3>${topicBars(P.topics)}</div>
  <div class="card"><h3>Recent activity</h3>${P.recent.length?P.recent.slice(0,10).map(r=>`<div class="rev"><span>${esc(itemTitle(r.item_id))}<br><small style="color:var(--sub)">${LV[r.level]?LV[r.level].name:''} · ${new Date(r.at_ms).toLocaleDateString()} · ${fmtDur(r.seconds)}${r.total?' · '+Math.round((r.accuracy||0)*100)+'% first try':''}</small></span><b>${r.completed?'+'+(r.points||0)+' ⭐':'Try again'}</b></div>`).join(''):'<p class="sub" style="margin:0">Finish a lesson and it will show up here.</p>'}</div>
  <div class="card"><h3>Stickers</h3><p class="sub" style="margin:0">${P.badges.length} of ${BADGES.length} collected.</p></div>`;
  return h;
}
ACT.myProgress=()=>openProgress();
ACT.progressBack=()=>{meView='home';render()};
