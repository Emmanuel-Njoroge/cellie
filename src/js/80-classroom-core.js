/* ================= CLASSROOM MODE (class codes, saved on Netlify) ================= */
const FORM={},mem2={};
const NETKEY='cellie-net',TKEY='cellie-teacher';
const lsGet=k=>{try{const r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(e){return mem2[k]||null}};
const lsSet=(k,v)=>{try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){mem2[k]=v}};
const remote=()=>session==='cloud'||session==='class';
async function api(path,body,opt){
  const o=body===undefined?{}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)};
  const r=await fetch('/api/'+path,Object.assign(o,opt||{}));
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok)throw Object.assign(new Error(j.error||'error'),{code:j.error||'error',status:r.status});
  return j;
}
const NETERR={class_archived:"Your teacher archived this class, so new progress can't be saved right now.",class_not_found:"We couldn't find that class code. Check it and try again.",nick_taken:"That name is already used in this class. Pick another.",nick_short:"Pick a name first.",pin_format:"Your PIN must be exactly 4 numbers.",login_failed:"That name and PIN don't match. Check them and try again.",locked:"Too many tries. Wait 10 minutes or ask your teacher to reset your PIN.",unauthorized:"That didn't work. Check the code and key and try again.",bad_signup:"That school signup code isn't right.",name_required:"Please type a class name.",too_large:"That is too much data to save.",server_error:"Something went wrong on the server. Try again in a moment."};
const netMsg=e=>NETERR[e&&e.code]||'We could not reach the server. Check your internet and try again.';
async function netProbe(){
  try{
    if(!/^https?:$/.test(location.protocol)||window.claude){NET.ok=false}
    else{const j=await api('ping');NET.ok=!!j.ok&&j.db!==false;NET.needsSignup=!!j.needsSignup;SKEW=(j.now||Date.now())-Date.now()}
  }catch(e){NET.ok=false}
  NET.checked=true;if(screen==='login')render();
}
const summaryDoc=()=>({nick:S.nick,avatar:S.avatar,level:S.level,pts:S.pts,total:total(),wk:S.week.k,wc:S.week.c,wt:S.week.t,lessons:Object.keys(S.done).length,comp:completion(),stats:S.stats,streak:curStreak(),last:S.last,chap:Object.keys(S.cur).filter(k=>k.startsWith('book-')).length,vid:Object.keys(S.cur).filter(k=>k.startsWith('vid-')).length});
let netBusy=false,netAgain=false;
async function netSync(){
  if(session!=='class'||!CLS)return;
  if(netBusy){netAgain=true;return}
  netBusy=true;
  try{do{netAgain=false;await api('student/save',{code:CLS.code,id:CLS.id,token:CLS.token,state:snap(S),summary:summaryDoc()})}while(netAgain);cloudNote=''}
  catch(e){if(e.status===401){cloudNote='Your login expired. Log out and log in again to keep saving.'}else{setTimeout(()=>scheduleSync(),6000)}}
  finally{netBusy=false}
}
let classTimer=null,beatTimer=null;
function startClassLoop(){
  stopClassLoop();pollClass();
  classTimer=setInterval(()=>{if(!document.hidden)pollClass()},5000);
  beatTimer=setInterval(()=>{if(!document.hidden)liveBeat(true)},15000);
}
function stopClassLoop(){clearInterval(classTimer);clearInterval(beatTimer);classTimer=beatTimer=null}
async function pollClass(){
  if(session!=='class'||!CLS)return;
  try{
    const j=await api('class/board',{code:CLS.code,weekStart:weekKey()});
    SKEW=j.now-Date.now();CLS.name=j.name;BOARD=j.students;
    LIVE=j.students.filter(x=>x.live&&x.live.ts).map(x=>Object.assign({},x.live,{id:x.id,nick:x.nick,avatar:x.avatar,level:x.level,comp:x.comp}));
    if(screen==='home'){
      if(tab==='ranks'){const m=document.querySelector('.main');if(m)m.innerHTML=ranksHTML()}else refreshLiveViews();
    }
  }catch(e){if(e.status===404){cloudNote='This class no longer exists.'}}
}
function acctText(){
  if(session==='class')return `You're in <b>${esc(CLS.name)}</b> (code ${esc(CLS.code)}). Log in on any device with the name <b>${esc(S.nick)}</b> and your PIN. Progress saves to your class automatically.`;
  return session==='cloud'?'Signed in. Your progress and leaderboard scores are saved to your account.':'Playing as a guest. Progress is saved on this device only.';
}
function enterClass(){startClassLoop();enter();scheduleSync(true);flushOutbox()}
function loginHTML(){
  const c=lsGet(NETKEY),canNet=NET.checked&&NET.ok;
  let st;
  if(canNet)st='Join your class with the code from your teacher. Your progress will be saved and you will see your classmates on the live board.';
  else if(cloud==='ready')st='<b>✓ Signed in.</b> Your progress will be saved to your account and you can join the leaderboards.';
  else if(!NET.checked||cloud==='checking')st='Getting ready...';
  else st='Class codes are not available here. You can still play as a guest on this device.';
  return `<div class="login">${mascot('cheer',130)}<h1>Cellie</h1><p class="tag">Learn how your body works. Pick your level, earn points, and climb the class leaderboard.</p>
  <div class="lcard"><div class="status" role="status">${st}</div>
  ${canNet&&c?`<button class="btn wide" data-act="resume">Continue as ${esc(c.nick)}</button><div class="note" style="margin:-6px 0 0;text-align:center">${esc(c.className||'')}</div>`:''}
  ${(canNet||!NET.checked)?`<button class="btn ${canNet&&c?'ghost ':''}wide" data-act="joinClass" ${canNet?'':'disabled'}>Join my class</button>`:''}
  ${cloud==='ready'?`<button class="btn ${canNet?'ghost ':''}wide" data-act="signin">Sign in and save my progress</button>`:''}
  <button class="btn ghost wide" data-act="guest">Play as a guest</button>
  ${FORM.loginErr?`<div class="errbox">${esc(FORM.loginErr)}</div>`:''}
  <p class="note">Guests save progress on this device only and are not on any leaderboard. Boards show a fun animal name, never a real name.</p></div>
  ${canNet?`<button class="btn ghost sm" data-act="teacher">I'm a teacher</button>`:''}
  <div class="pills">${LVK.map(k=>`<span class="pill">${LV[k].icon} ${LV[k].name} · ${LV[k].grade}</span>`).join('')}</div></div>`;
}
