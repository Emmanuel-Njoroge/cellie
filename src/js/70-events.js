/* ================= EVENTS ================= */
document.addEventListener('click',e=>{
  const dd=e.target.closest('.dd');
  if(dd&&e.detail===0&&L&&L.cur){ddTap(+dd.dataset.id,dd.dataset.from);return}
  const z=e.target.closest('[data-zone]');
  if(z&&!dd&&L&&L.cur&&!L.cur.done&&L.cur.held!==null&&L.cur.held!==undefined&&(L.cur.q.t==='sort'||L.cur.q.t==='fill')){dropTo(L.cur.held,z.dataset.zone);return}
  const t=e.target.closest('[data-act]');if(!t)return;
  const a=t.dataset.act,d=t.dataset;
  if(a==='backdrop'){if(e.target===t)closeModal();return}
  if(ACT[a]){ACT[a](t,d,e);return}
  const c=L&&L.cur;
  switch(a){
    case 'signin':signIn();break;
    case 'joinClass':FORM.loginErr='';JN={step:1,err:''};screen='join';render();break;
    case 'toLogin':clearInterval(tcTimer);screen='login';render();break;
    case 'joinCheck':joinCheck();break;
    case 'joinNew':startSetup();su.cls={code:JN.code,name:JN.name};su.err='';FORM.pin='';render();break;
    case 'joinBack':JN.step=3;JN.err='';render();break;
    case 'joinLogin':joinLogin();break;
    case 'resume':resume();break;
    case 'leaveClass':modal('<div class="sheet"><h2>Leave this class?</h2><p>Your saved progress and your spot on the board will be deleted.</p><div class="row" style="flex-direction:column"><button class="btn wide" data-act="closeModal">Stay in class</button><button class="btn bad wide" data-act="doLeave">Leave and delete</button></div></div>');break;
    case 'doLeave':(async()=>{try{await api('student/leave',{code:CLS.code,id:CLS.id,token:CLS.token})}catch(e){}stopClassLoop();lsSet(NETKEY,null);lsSet(OUTKEY,null);CLS=null;session=null;S=defaults();saveLocal();closeModal();screen='login';render()})();break;
    case 'teacher':openTeacher();break;
    case 'guest':guest();break;
    case 'tab':tab=d.v;meView='home';render();window.scrollTo(0,0);break;
    case 'newNames':su.opts=nameOpts();su.nick=su.opts[0].nick;su.avatar=su.opts[0].avatar;render();break;
    case 'pickName':{const o=su.opts[+d.v];su.nick=o.nick;su.avatar=o.avatar;render();break}
    case 'suLevel':su.level=d.v;render();break;
    case 'suPal':su.pal=d.v;S.theme.pal=d.v;S.theme.custom='';applyTheme();render();break;
    case 'finishSetup':finishSetup();break;
    case 'changeName':{su={nick:S.nick,avatar:S.avatar,level:S.level,pal:S.theme.pal,opts:nameOpts()};modal(`<div class="sheet"><h2>Pick a new name</h2><div class="namegrid" style="width:100%">${su.opts.map((o,i)=>`<button class="opt" data-act="renameTo" data-v="${i}"><span class="big">${o.avatar}</span><span>${esc(o.nick)}</span></button>`).join('')}</div><button class="btn ghost wide" data-act="closeModal">Cancel</button></div>`);break}
    case 'renameTo':{const o=su.opts[+d.v];S.nick=o.nick;S.avatar=o.avatar;persist(true);closeModal();render();break}
    case 'setLevel':S.level=d.v;persist(true);render();break;
    case 'setPal':S.theme.pal=d.v;S.theme.custom='';applyTheme();persist();render();break;
    case 'setMode':S.theme.mode=d.v;applyTheme();persist();render();break;
    case 'setMono':S.theme.mono=d.v==='1';persist();render();break;
    case 'sound':S.sound=!S.sound;persist();render();break;
    case 'logout':flushTime(true);flushOutbox();liveOff();stopClassLoop();session=null;screen='login';render();break;
    case 'node':openItem(+d.i);break;
    case 'gotoLive':tab='live';render();window.scrollTo(0,0);break;
    case 'closeReader':closeReader();break;
    case 'rdNext':if(RD){if(RD.page<RD.bk.pages.length){RD.page++;actQ.qa=RD.page;liveBeat();renderReader();const lb=document.querySelector('#reader .lb');lb&&(lb.scrollTop=0)}else finishItem(RD.it,'Chapter')}break;
    case 'rdPrev':if(RD&&RD.page>0){RD.page--;renderReader()}break;
    case 'speakPage':if(RD){const pg=RD.bk.pages[RD.page];speak(pg[0]+'. '+pg[1])}break;
    case 'vPlay':if(VD){if(VD.ended){VD.scene=0;playScene()}else if(VD.playing){VD.playing=false;clearTimeout(vt);try{speechSynthesis.cancel()}catch(e){}renderReader()}else playScene()}break;
    case 'vNext':if(VD&&VD.scene<VD.vd.length-1){VD.scene++;playScene()}break;
    case 'vPrev':if(VD&&VD.scene>0){VD.scene--;playScene()}break;
    case 'vNarr':if(VD){VD.narr=!VD.narr;if(!VD.narr){try{speechSynthesis.cancel()}catch(e){}}else speak(VD.vd[VD.scene][2]);renderReader()}break;
    case 'vSkip':if(VD){clearTimeout(vt);try{speechSynthesis.cancel()}catch(e){}VD.scene=VD.vd.length-1;VD.ended=true;VD.playing=false;renderReader()}break;
    case 'vFinish':if(VD)finishItem(VD.it,'Video');break;
    case 'start':startLesson(+d.u,+d.l);break;
    case 'practice':startLesson(+d.u,+d.l,d.k);meView='home';tab='learn';break;
    case 'learnGo':L.screen='q';L.cur=prep(L.queue[0]);renderLesson();break;
    case 'hint':modal(`<div class="sheet read">${learnBody(L.l,L.lv)}<button class="btn wide" data-act="closeModal">Back to the quiz</button></div>`);break;
    case 'speak':if(c)speak(c.q.q);break;
    case 'speakDef':speak(L.l.learn.def);break;
    case 'closeModal':closeModal();break;
    case 'quit':modal(`<div class="sheet">${mascot('sad',90)}<h2>Leave this lesson?</h2><p>You will lose your progress in this lesson.</p><div class="row" style="flex-direction:column"><button class="btn wide" data-act="closeModal">Keep learning</button><button class="btn ghost wide" data-act="leaveNow" style="color:var(--bad-tx)">End session</button></div></div>`);break;
    case 'leaveNow':closeModal();leave();break;
    case 'leave':leave();break;
    case 'retryLesson':startLesson(L.ui,L.li,L.lv);break;
    case 'pick':if(c&&!c.done){c.sel=c.q.t==='tf'?d.v==='true':+d.v;sfx.tick();renderLesson()}break;
    case 'ml':if(c&&!c.done){c.pickL=+d.v;sfx.tick();c.pickR!==null?matchResolve(c):renderLesson()}break;
    case 'mr':if(c&&!c.done){c.pickR=+d.v;sfx.tick();c.pickL!==null?matchResolve(c):renderLesson()}break;
    case 'place':if(c&&!c.done){c.placed.push(+d.v);sfx.tick();renderLesson()}break;
    case 'unplace':if(c&&!c.done){c.placed.splice(+d.v,1);sfx.tick();renderLesson()}break;
    case 'check':check();break;
    case 'cont':cont();break;
    case 'rankKind':rankKind=d.v;render();break;
    case 'rankLv':rankLv=d.v;render();break;
    case 'gate':newGate();break;
    case 'gateAns':
      if(d.v===d.r){gate=true;meView='grown';closeModal();tab='me';render();window.scrollTo(0,0)}
      else{const s=document.querySelector('#modal .sheet');s&&s.classList.add('shake');setTimeout(newGate,350)}
      break;
    case 'lockGrown':gate=false;meView='home';render();break;
    case 'reset':modal(`<div class="sheet"><h2>Reset everything?</h2><p>This clears lessons, points, streaks, stickers${session==='cloud'?', and the leaderboard entry':''}.</p><div class="row" style="flex-direction:column"><button class="btn wide" data-act="closeModal">Keep my progress</button><button class="btn bad wide" data-act="doReset">Yes, reset</button></div></div>`);break;
    case 'doReset':doReset();break;
  }
});
async function doReset(){
  closeModal();
  if(session==='class'){const keep={nick:S.nick,avatar:S.avatar,level:S.level};S=defaults();Object.assign(S,keep);saveLocal();applyTheme();gate=false;meView='home';SS={pts:0,qa:0,qc:0,run:0};scheduleSync(true);tab='learn';screen='home';render();return}
  const was=session;
  S=defaults();saveLocal();applyTheme();gate=false;meView='home';
  if(was==='cloud'&&DB&&!cloudBlocked){try{await DB.doc('data/users/'+UID+'/profile').delete();await DB.doc('board/'+UID).delete()}catch(e){}}
  startSetup();
}
document.addEventListener('input',e=>{
  if(e.target.dataset&&e.target.dataset.f)FORM[e.target.dataset.f]=e.target.value;
  if(e.target.id==='cc'){S.theme.custom=e.target.value;applyTheme()}
});
document.addEventListener('change',e=>{
  if(e.target.id==='cc'){S.theme.custom=e.target.value;applyTheme();persist();render()}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&document.activeElement&&document.activeElement.id==='livew'){tab='live';render()}
  if(e.key==='Enter'&&L&&L.screen==='q'&&document.activeElement.tagName!=='BUTTON'&&$('#modal').hidden){
    const b=document.querySelector('#lesson [data-act=check]:not([disabled]),#lesson [data-act=cont]');b&&b.click();
  }
});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{applyTheme()})}catch(e){}
document.addEventListener('visibilitychange',()=>{if(document.hidden){saveLocal();scheduleSync(true);flushTime(true)}else liveBeat(true)});
window.addEventListener('pagehide',()=>{flushTime(true);liveOff()});
