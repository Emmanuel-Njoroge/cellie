/* ----- student join flow ----- */
let JN={step:1,err:''};
const inp=(f,ph,extra)=>`<input class="input" data-f="${f}" value="${esc(FORM[f]||'')}" placeholder="${ph}" autocomplete="off" ${extra||''}>`;
function joinHTML(){
  let b;
  if(JN.step===1)b=`<span class="lbl">Class code from your teacher</span>${inp('jc','ABC-123','maxlength="7" style="text-transform:uppercase;letter-spacing:3px;text-align:center;font-size:26px"')}<button class="btn wide" data-act="joinCheck">Next</button>`;
  else if(JN.step===2)b=`<p style="text-align:center;font-size:18px">You're joining<br><b style="font-size:24px">${esc(JN.name)}</b></p><button class="btn wide" data-act="joinNew">I'm new here</button><button class="btn ghost wide" data-act="joinBack">I've played before</button>`;
  else b=`<span class="lbl">Your name (like Brave Otter 21)</span>${inp('jn','Your animal name')}<span class="lbl">Your 4-number PIN</span>${inp('jp','4 numbers','type="password" inputmode="numeric" maxlength="4"')}<button class="btn wide" data-act="joinLogin">Log in</button>`;
  return `<div class="join">${mascot('happy',100)}<h1>Join a class</h1><div class="lcard">${b}${JN.err?`<div class="errbox">${esc(JN.err)}</div>`:''}</div><button class="btn ghost sm" data-act="toLogin" style="align-self:center">Back</button></div>`;
}
async function joinCheck(){
  const code=(FORM.jc||'').trim();if(code.length<6){JN.err='Type the 6-letter class code.';render();return}
  try{const j=await api('class/join',{code});JN={step:2,err:'',code:j.code,name:j.name}}catch(e){JN.err=netMsg(e)}
  render();
}
async function joinLogin(){
  try{
    const j=await api('student/login',{code:JN.code,nick:FORM.jn||'',pin:FORM.jp||''});
    S=j.state?fix(j.state):Object.assign(defaults(),{nick:j.nick,avatar:j.avatar});
    S.nick=j.nick;S.avatar=j.avatar||S.avatar;
    CLS={code:JN.code,id:j.id,token:j.token,name:j.className};UID=j.id;session='class';
    lsSet(NETKEY,{code:CLS.code,id:j.id,token:j.token,nick:S.nick,className:j.className});
    FORM.jp='';applyTheme();saveLocal();enterClass();
  }catch(e){JN.err=netMsg(e);render()}
}
async function resume(){
  const c=lsGet(NETKEY);if(!c)return;
  try{
    const j=await api('student/me',{code:c.code,id:c.id,token:c.token});
    S=j.state?fix(j.state):Object.assign(defaults(),{nick:j.nick,avatar:j.avatar});
    S.nick=j.nick;S.avatar=j.avatar||S.avatar;
    CLS={code:c.code,id:c.id,token:c.token,name:j.className};UID=c.id;session='class';
    applyTheme();saveLocal();enterClass();
  }catch(e){
    if(e.status===401||e.status===404){lsSet(NETKEY,null);FORM.loginErr='Please log in again with your name and PIN.';JN={step:e.status===404?1:1,err:''};screen='login'}
    else FORM.loginErr=netMsg(e);
    render();
  }
}
function pinSectionHTML(){
  return `<section><h2>4. Make a secret PIN</h2><p class="sub" style="margin-bottom:8px">Use 4 numbers. You will use your name and PIN to log in on another computer.</p>${inp('pin','4 numbers','type="password" inputmode="numeric" maxlength="4"')}</section>`;
}
async function finishSetup(){
  if(!su.cls){S.nick=su.nick;S.avatar=su.avatar;S.level=su.level;S.theme.pal=su.pal;persist(true);if(session==='cloud')subscribeBoard();enter();return}
  const pin=(FORM.pin||'').trim();
  if(!/^\d{4}$/.test(pin)){su.err=NETERR.pin_format;render();return}
  su.err='';
  try{
    const j=await api('student/register',{code:su.cls.code,nick:su.nick,avatar:su.avatar,pin,level:su.level});
    S=defaults();S.nick=su.nick;S.avatar=su.avatar;S.level=su.level;S.theme.pal=su.pal;
    CLS={code:su.cls.code,id:j.id,token:j.token,name:j.className};UID=j.id;session='class';
    lsSet(NETKEY,{code:CLS.code,id:j.id,token:j.token,nick:S.nick,className:j.className});
    saveLocal();FORM.pin='';enterClass();
    modal(`<div class="sheet">${mascot('cheer',90)}<h2>You're in!</h2><p>Write this down so you can log in on another computer:</p><div class="card" style="width:100%;text-align:left;margin:0"><div>Class: <b>${esc(CLS.name)}</b> (${esc(CLS.code)})</div><div>Name: <b>${esc(S.nick)}</b></div><div>PIN: <b>${esc(pin)}</b></div></div><button class="btn wide" data-act="closeModal">Got it</button></div>`);
  }catch(e){su.err=netMsg(e);render()}
}
