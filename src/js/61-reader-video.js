/* ================= TEXTBOOK READER ================= */
function startReader(it){
  const bk=it.u.book[S.level];RD={it,bk,page:0,startedAt:Date.now()};VD=null;
  act='Reading: '+bk.short;actQ={qa:0,qt:bk.pages.length+1};liveBeat(true);renderReader();
}
function startVideo(it){
  const vd=it.u.vid[S.level];VD={it,vd,scene:0,playing:true,narr:S.sound,ended:false,dur:5000,startedAt:Date.now()};RD=null;
  act='Watching: '+it.u.book[S.level].short;actQ={qa:0,qt:vd.length};liveBeat(true);playScene();
}
function sceneMs(sc){return Math.max(4800,Math.min(9500,sc[2].split(' ').length*430+2200))}
function playScene(){
  clearTimeout(vt);if(!VD)return;
  const sc=VD.vd[VD.scene];VD.dur=sceneMs(sc);VD.ended=false;VD.playing=true;
  renderReader();if(VD.narr&&canSpeak())speak(sc[2]);
  vt=setTimeout(()=>{
    if(!VD||!VD.playing)return;
    if(VD.scene<VD.vd.length-1){VD.scene++;actQ.qa=VD.scene;liveBeat();playScene()}
    else{VD.ended=true;VD.playing=false;actQ.qa=VD.vd.length;liveBeat();renderReader()}
  },VD.dur);
}
function closeReader(){clearTimeout(vt);try{speechSynthesis.cancel()}catch(e){}RD=null;VD=null;renderReader();act='On the path';actQ={qa:0,qt:0};liveBeat(true)}
function finishItem(it,label){
  const sec=Math.min(3600,Math.round((Date.now()-((RD||VD||{}).startedAt||Date.now()))/1000));
  const m=mult(),pts=5*m,first=!S.cur[it.id];
  if(first){S.cur[it.id]=1;awardPts(pts,S.level)}
  recordItem(it,sec,first);
  const before=earned();S.badges=before;persist(true);
  closeReader();render();
  modal(`<div class="sheet">${mascot('cheer',100)}<h2>${label} complete!</h2><p>${first?'You earned '+pts+' points.':'Nice review!'} The next step on your path is unlocked.</p><button class="btn wide" data-act="closeModal">Keep going</button></div>`);
  sfx.win();
}
function renderReader(){
  const el=$('#reader');
  if(!RD&&!VD){el.hidden=true;el.innerHTML='';return}
  el.hidden=false;
  if(RD){
    const {it,bk}=RD,u=it.u,p=RD.page,n=bk.pages.length,last=p===n;
    let inner;
    if(!last){
      const pg=bk.pages[p];
      inner=`<div class="eyebrow">${esc(bk.title)}</div><h2>${esc(pg[0])}</h2>${pg[2]?`<div class="vis" style="margin-bottom:12px">${VIS[pg[2]](S.level)}</div>`:''}<p>${esc(pg[1])} ${canSpeak()?`<button class="iconbtn" data-act="speakPage" aria-label="Read this page aloud">🔊</button>`:''}</p>`;
    }else{
      inner=`<div class="eyebrow">${esc(bk.title)}</div><h2>Key words</h2><div class="vocab">${bk.vocab.map(v=>`<div class="vcard"><b>${esc(v[0])}</b><span>${esc(v[1])}</span></div>`).join('')}</div>`;
    }
    el.innerHTML=`<div class="lh" style="--uc:${u.color}"><button class="xbtn" data-act="closeReader" aria-label="Close">✕</button><div class="bar"><i style="width:${Math.round((p+1)/(n+1)*100)}%"></i></div><span class="hearts" style="color:var(--accent-tx)">📖 ${p+1}/${n+1}</span></div><div class="lb" style="--uc:${u.color}"><article class="book">${inner}<div class="dots">${Array.from({length:n+1},(_,i)=>`<i class="${i===p?'on':''}"></i>`).join('')}</div></article></div><div class="lf"><div class="in"><button class="btn ghost" data-act="rdPrev" ${p?'':'disabled'}>Back</button><button class="btn" data-act="rdNext">${last?'Finish chapter':'Next'}</button></div></div>`;
    return;
  }
  const {it,vd,scene,playing,ended}=VD,u=it.u,sc=vd[scene];
  const prog=vd.map((_,i)=>`<i class="${i<scene||(ended&&i===scene)?'done':i===scene?'now':''}" style="--d:${VD.dur}ms"><b></b></i>`).join('');
  el.innerHTML=`<div class="lh" style="--uc:${u.color}"><button class="xbtn" data-act="closeReader" aria-label="Close">✕</button><div class="bar"><i style="width:${Math.round((scene+(ended?1:0))/vd.length*100)}%"></i></div><span class="hearts" style="color:var(--accent-tx)">🎬 ${scene+1}/${vd.length}</span></div><div class="lb" style="--uc:${u.color};--ud:${u.dark}"><div class="stage"><div class="tag">${esc(u.title.toUpperCase())} · ${LV[S.level].name.toUpperCase()}</div><div class="floaty" aria-hidden="true">${sc[1]}</div>${sc[0]?`<div class="vis" key="${scene}">${VIS[sc[0]](S.level)}</div>`:`<div class="bigemo" aria-hidden="true">${sc[1]}</div>`}<div class="cap" role="status" aria-live="polite">${esc(sc[2])}</div><div class="vprog ${playing?'':'paused'}">${prog}</div></div><div class="vctl"><button class="iconbtn" data-act="vPrev" aria-label="Previous scene" ${scene?'':'disabled'}>⏮</button><button class="iconbtn" data-act="vPlay" aria-label="${playing?'Pause':'Play'}">${ended?'↺':playing?'⏸':'▶️'}</button><button class="iconbtn" data-act="vNext" aria-label="Next scene" ${scene<vd.length-1?'':'disabled'}>⏭</button><button class="iconbtn" data-act="vNarr" aria-label="Narration ${VD.narr?'on':'off'}">${VD.narr?'🔊':'🔇'}</button></div></div><div class="lf"><div class="in">${ended?`<button class="btn" data-act="vFinish">Finish video</button>`:`<button class="btn ghost" data-act="vSkip">Skip to the end</button>`}</div></div>`;
}
