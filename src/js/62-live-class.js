/* ================= LIVE CLASS ================= */
const liveDoc=(ts,actTxt)=>({nick:S.nick,avatar:S.avatar,level:S.level,ts,act:actTxt,qa:actQ.qa,qt:actQ.qt,sp:SS.pts,ok:SS.qc,tot:SS.qa,run:SS.run,comp:completion()});
function liveBeat(force){
  const isClass=session==='class';
  if(!isClass&&(session!=='cloud'||!DB||cloudBlocked))return;
  const now=Date.now(),gap=isClass?3000:1500;
  if(!force&&now-lastBeat<gap){clearTimeout(liveT);liveT=setTimeout(()=>liveBeat(true),gap+100);return}
  lastBeat=now;
  if(isClass){api('student/live',{code:CLS.code,id:CLS.id,token:CLS.token,live:liveDoc(now,act),comp:completion()}).catch(()=>{});return}
  try{DB.doc('live/'+UID).set(liveDoc(now,act)).catch(()=>{})}catch(e){}
}
function liveOff(){
  if(session==='class'&&CLS){api('student/live',{code:CLS.code,id:CLS.id,token:CLS.token,off:true,live:liveDoc(0,'Offline'),comp:completion()},{keepalive:true}).catch(()=>{});return}
  if(session!=='cloud'||!DB||cloudBlocked)return;
  try{DB.doc('live/'+UID).set(liveDoc(0,'Offline')).catch(()=>{})}catch(e){}
}
const ACTIVE_MS=45000;
const activeLive=()=>{const now=Date.now()+SKEW;return LIVE.filter(d=>now-(d.ts||0)<ACTIVE_MS).sort((a,b)=>(b.sp||0)-(a.sp||0)||(b.comp||0)-(a.comp||0)||(b.ok||0)-(a.ok||0))};
const RC=['#e21b3c','#1368ce','#d89e00','#26890c','#8b5cf6','#ff7a1a'];
function liveWidgetHTML(){
  if(!remote())return '';
  const a=activeLive(),t=a[0];
  return `<div id="livew" class="livew" data-act="gotoLive" role="button" tabindex="0" aria-label="Open the live class board"><span class="dot"></span><b>LIVE</b><span>${a.length} playing now</span>${t?`<span>🥇 ${esc(t.avatar||'🙂')} ${esc(t.nick||'Explorer')} · ${t.sp||0} pts</span>`:''}<span class="go">Open ›</span></div>`;
}
function liveHTML(){
  let h=`<div class="lhead"><h1><span class="dot"></span> Live class</h1><p>See who is playing right now, what they are working on, and how far through the course they are. It updates every few seconds.</p></div>`;
  if(!remote())return h+`<div class="card" style="text-align:center;margin-top:14px">${mascot('happy',90)}<h3 style="margin-top:8px">Sign in to join the live board</h3><p class="sub">Guests can't be shown on the live board. Log out and join your class (or sign in) to appear here.</p></div>`;
  if(cloudNote)h+=`<div class="banner">${esc(cloudNote)}</div>`;
  const a=activeLive();
  h+=`<p class="sub" style="margin-top:12px"><b>${a.length}</b> ${a.length===1?'player is':'players are'} active now. Points here are earned this visit, so everyone starts fresh.</p>`;
  if(!a.length)return h+`<div class="card" style="text-align:center">${mascot('happy',80)}<p class="sub" style="margin:8px 0 0">Nobody is active yet. Start a lesson and you'll show up here! Share the link so friends can join.</p></div>`;
  if(a.length>=2){
    const top=a.slice(0,3),order=top.length===3?[1,0,2]:[1,0],hts={0:130,1:98,2:74};
    h+=`<div class="podium">${order.map(i=>{const d=top[i];return `<div class="pod"><div class="who"><span>${esc(d.avatar||'🙂')}</span>${esc(d.nick||'Explorer')}</div><div class="blk" style="height:${hts[i]}px;background:${RC[i]}">${['1st','2nd','3rd'][i]}<small>${d.sp||0} pts</small></div></div>`}).join('')}</div>`;
  }
  h+=a.slice(0,30).map((d,i)=>{
    const acc=d.tot?Math.round((d.ok||0)/d.tot*100):null,pr=d.qt?Math.round((d.qa||0)/d.qt*100):0;
    return `<div class="lrow ${d.id===UID?'me':''}" style="--rc:${RC[i%RC.length]}"><div class="top"><div class="rk">${i+1}</div><div class="av" aria-hidden="true">${esc(d.avatar||'🙂')}</div><div class="nm">${esc(d.nick||'Explorer')}${d.id===UID?' (you)':''}<small>${LV[d.level]?LV[d.level].icon+' '+LV[d.level].name+' · ':''}${esc(d.act||'On the path')}</small></div><div class="sc">${d.sp||0}<small>points</small></div></div><div class="lbar" title="Progress in current activity"><i style="width:${pr}%"></i></div><div class="lmeta"><span>Now: ${d.qa||0}/${d.qt||0}</span><span>Course: ${d.comp||0}% done</span><span>${acc===null?'No answers yet':acc+'% correct'}</span><span>🔥 ${d.run||0} in a row</span></div></div>`;
  }).join('');
  return h;
}
function refreshLiveViews(){
  if(screen!=='home')return;
  if(tab==='live'){const m=document.querySelector('.main');if(m)m.innerHTML=liveHTML()}
  else if(tab==='learn'){const w=$('#livew');if(w)w.outerHTML=liveWidgetHTML()}
}
function subscribeLive(){
  if(!DB)return;
  try{DB.collection('live').limit(200).onSnapshot(sn=>{LIVE=sn.docs.map(d=>Object.assign({id:d.id},d.data()));refreshLiveViews()},()=>{})}catch(e){}
}
function startLiveLoop(){
  if(liveOn)return;liveOn=true;subscribeLive();
  setInterval(()=>{if(session==='cloud'&&!document.hidden)liveBeat(true);refreshLiveViews()},12000);
  liveBeat(true);
}
