/* ================= RENDER ================= */
function render(){
  const app=$('#app');
  if(screen==='login'){app.innerHTML=loginHTML();return}
  if(screen==='setup'){app.innerHTML=setupHTML();return}
  if(screen==='join'){app.innerHTML=joinHTML();return}
  if(screen==='teacher'){app.innerHTML=teacherHTML();return}
  const t=(id,ic,label)=>`<button data-act="tab" data-v="${id}" ${tab===id?'aria-current="page"':''}><span class="ic">${ic}</span>${label}</button>`;
  const body=tab==='learn'?learnHTML():tab==='live'?liveHTML():tab==='ranks'?ranksHTML():tab==='stickers'?stickersHTML():meHTML();
  app.innerHTML=`<div class="shell"><nav class="nav" aria-label="Main"><div class="brand">${mascot('happy',40)}cellie</div>${t('learn','🗺️','Learn')}${t('live','🔴','Live')}${t('ranks','🏆','Ranks')}${t('stickers','🏅','Stickers')}${t('me','🙂','Me')}</nav><main class="main">${body}</main></div>`;
}

function setupHTML(){
  return `<div class="setup"><div style="align-self:center">${mascot('happy',100)}</div><h1>${su.cls?'Join '+esc(su.cls.name):'Create your explorer'}</h1>
  <section><h2>1. Pick your name</h2><div class="namegrid">${su.opts.map((o,i)=>`<button class="opt ${su.nick===o.nick?'sel':''}" data-act="pickName" data-v="${i}"><span class="big">${o.avatar}</span><span>${esc(o.nick)}</span></button>`).join('')}</div><button class="btn ghost sm" style="margin-top:10px" data-act="newNames">🎲 More names</button></section>
  <section><h2>2. Pick your level</h2><div class="opts" style="display:flex;flex-direction:column;gap:10px">${LVK.map(k=>`<button class="opt ${su.level===k?'sel':''}" data-act="suLevel" data-v="${k}"><span class="big">${LV[k].icon}</span><span class="lvl"><b>${LV[k].name} · ${LV[k].grade}</b><small>${LV[k].ages}. ${LV[k].blurb}</small></span></button>`).join('')}</div></section>
  <section><h2>3. Pick your color</h2><div class="swatches">${PALS.map(p=>`<button class="sw" style="--c:${p[1]};--ink:${lum(p[1])>.5?'#1f2a30':'#fff'}" aria-label="${p[0]}" aria-pressed="${su.pal===p[0]}" data-act="suPal" data-v="${p[0]}"></button>`).join('')}</div></section>
  ${su.cls?pinSectionHTML():''}${su.err?`<div class="errbox">${esc(su.err)}</div>`:''}<button class="btn wide" data-act="finishSetup">Start learning</button></div>`;
}

function learnHTML(){
  const td=S.days[today()]||0,g=goalPts(),pct=Math.min(100,Math.round(td/g*100));
  let h=`<div class="topbar"><span class="stat-pill sp-s" title="Day streak">🔥 ${curStreak()}</span><span class="stat-pill sp-p" title="Total points">⭐ ${total()}</span><div class="goal"><div class="gbar" role="progressbar" aria-valuenow="${td}" aria-valuemin="0" aria-valuemax="${g}" aria-label="Daily goal"><i style="width:${pct}%"></i></div><small>${td>=g?'Daily goal reached!':td+' of '+g+' points today'} · ⏱ ${fmtDur(timeToday())}</small></div><span class="avatar" aria-hidden="true">${S.avatar}</span></div>`;
  if(cloudNote)h+=`<div class="banner">${esc(cloudNote)}</div>`;
  h+=liveWidgetHTML();
  h+=`<div class="lvbar chips" role="group" aria-label="Level">${LVK.map(k=>`<button data-act="setLevel" data-v="${k}" aria-pressed="${S.level===k}">${LV[k].icon} ${LV[k].name}</button>`).join('')}</div>`;
  const seq=seqState(S.level),cur=seq.findIndex(x=>!x.done),OFF=[0,46,66,46,0,-46,-66,-46];
  let n=0;
  UNITS.forEach((u,ui)=>{
    const uc=S.theme.mono?'var(--accent)':u.color,ud=S.theme.mono?'var(--accent-d)':u.dark;
    h+=`<section style="--uc:${uc};--ud:${ud}"><div class="unit" data-icon="${u.icon}"><h2>${esc(u.title)}</h2><p>${esc(u.desc)}</p></div><div class="path">`;
    seq.forEach((it,gi)=>{
      if(it.ui!==ui)return;
      const off=OFF[n++%OFF.length],isCur=gi===cur;
      const icon=it.done?(it.kind==='sticker'?u.sticker:(it.kind==='lesson'||it.kind==='challenge')?'⭐':'✅'):it.open?it.icon:(it.kind==='sticker'?'🎁':'🔒');
      h+=`<div class="nodewrap" style="transform:translateX(${off}px)">${isCur?'<div class="start">START</div>':''}<button class="node k-${it.kind} ${it.done?'done':''} ${it.open?'':'locked'} ${isCur?'cur':''}" data-act="node" data-i="${gi}" aria-label="${esc(it.title)}${it.done?', completed':it.open?'':', locked'}"><span>${icon}</span></button><div class="nlabel">${esc(it.title)}</div></div>`;
    });
    h+='</div></section>';
  });
  return h;
}

function learnBody(l,lv){
  const x=l.learn;let h=`<div class="learn"><h2>${esc(l.title)}</h2>`;
  if(x.vis)h+=`<div class="vis">${VIS[x.vis](lv)}</div>`;
  h+=`<div class="def">${esc(x.def)}${lv==='b'&&canSpeak()?` <button class="iconbtn" data-act="speakDef" aria-label="Read aloud">🔊</button>`:''}</div>`;
  if(x.pts&&x.pts.length)h+=`<ul class="pts">${x.pts.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`;
  if(x.flow)h+=`<div class="flow">${x.flow.map((f,i)=>`${i?'<span class="ar" aria-hidden="true">→</span>':''}<div class="st"><span>${f[0]}</span>${esc(f[1])}</div>`).join('')}</div>`;
  if(x.cmp)h+=`<div class="tblwrap"><table class="cmp"><thead><tr>${x.cmp.h.map(c=>`<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${x.cmp.r.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  return h+'</div>';
}
function lessonSheet(ui,li){
  const u=UNITS[ui],l=lessonsFor(u,S.level)[li],dn=S.done[l.id],m=mult(),ch=li===2;
  modal(`<div class="sheet" style="--uc:${u.color}"><span class="tagc">${esc(u.title)} · ${LV[S.level].name}</span><h2>${ch?'⚡ ':''}${esc(l.title)}</h2><p>${l.qs.length} questions. Earn up to ${l.qs.length*2*m+10*m} points.${dn?' Your best: '+'⭐'.repeat(dn.stars||1):''}</p><button class="btn wide" data-act="start" data-u="${ui}" data-l="${li}">${dn?'Practice again':'Start'}</button></div>`);
}
function lockedSheet(it){
  modal(`<div class="sheet" style="--uc:${it.u.color}">${mascot('sad',80)}<span class="tagc">${esc(it.u.title)}</span><h2>${esc(it.title)}</h2><p>Finish the step before this one to unlock it.</p><button class="btn wide" data-act="closeModal">Okay</button></div>`);
}
function stickerSheet(it){
  const u=it.u,all=it.done;
  modal(`<div class="sheet" style="--uc:${u.color}">${all?`<div style="font-size:72px;line-height:1">${u.sticker}</div><span class="tagc">${esc(u.title)}</span><h2>${esc(u.stickerName)}!</h2><p>You finished the chapter, the video, and every lesson in this unit. Nice work, scientist!</p>`:`<div style="font-size:72px;line-height:1;opacity:.6">🎁</div><h2>Sticker locked</h2><p>Finish the chapter, video, and all lessons in ${esc(u.title)} to collect it.</p>`}<button class="btn wide" data-act="closeModal">${all?'Cool!':'Okay'}</button></div>`);
}
function openItem(gi){
  const it=seqState(S.level)[gi];if(!it)return;
  if(!it.open){lockedSheet(it);return}
  if(it.kind==='book')startReader(it);
  else if(it.kind==='video')startVideo(it);
  else if(it.kind==='sticker')stickerSheet(it);
  else lessonSheet(it.ui,it.li);
}
