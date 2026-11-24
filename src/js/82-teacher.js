/* ----- teacher: accounts, classes, dashboards, management ----- */
let TS={step:'menu',tab:'overview',err:'',made:null,key:'',classes:[],code:'',data:null,fetched:0,st:null,audit:null},tcTimer=null;
const tApi=(path,extra)=>api(path,Object.assign({key:TS.key,code:TS.code,today:today(),weekStart:weekKey()},extra||{}));
const tNow=()=>TS.data?TS.data.now+(Date.now()-TS.fetched):Date.now();
const ago=ms=>{const m=Math.round(ms/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' hr ago':Math.round(m/1440)+' days ago'};
const modalOpen=()=>!$('#modal').hidden;

function openTeacher(){
  const c=lsGet(TKEY);screen='teacher';
  TS=Object.assign(TS,{step:'menu',err:'',made:null,data:null,st:null});render();
  if(c&&c.key){TS.key=c.key;tLogin(c.key,true)}
}
async function tLogin(key,quiet){
  try{
    const j=await api('teacher/login',{key});
    TS.key=key;lsSet(TKEY,{key});TS.classes=j.classes;TS.err='';
    if(j.classes.length===1&&!j.classes[0].archived)return tOpen(j.classes[0].code,'overview');
    TS.step='home';render();
  }catch(e){if(quiet)lsSet(TKEY,null);else TS.err=netMsg(e);TS.step='menu';render()}
}
async function tOpen(code,tab){
  TS.code=code.replace(/[^A-Za-z0-9]/g,'').toUpperCase();TS.tab=tab||'overview';TS.step='class';TS.data=null;TS.audit=null;
  render();await tRefresh();
  clearInterval(tcTimer);
  tcTimer=setInterval(()=>{if(screen==='teacher'&&TS.step==='class'&&!document.hidden)tRefresh(true)},10000);
}
async function tRefresh(quiet){
  try{
    TS.data=await tApi('teacher/overview');TS.fetched=Date.now();
    if(screen==='teacher'&&TS.step==='class'&&!(quiet&&modalOpen()))render();
  }catch(e){if(e.status===401||e.status===404){TS.err=netMsg(e);TS.step='menu';lsSet(TKEY,null);if(screen==='teacher')render()}}
}
async function tOpenStudent(id){
  TS.step='student';TS.st=null;render();window.scrollTo(0,0);
  try{TS.st=await tApi('teacher/student',{id});render()}catch(e){TS.step='class';render()}
}
async function tDownload(kind){
  try{
    const j=await tApi('teacher/export',{kind}),a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([j.csv],{type:'text/csv'}));a.download=j.filename;document.body.appendChild(a);a.click();a.remove();
  }catch(e){TS.err=netMsg(e);render()}
}

/* ---------- screens ---------- */
function teacherHTML(){
  const err=TS.err?`<div class="errbox">${esc(TS.err)}</div>`:'';
  if(TS.step==='menu')return `<div class="join">${mascot('happy',90)}<h1>Teacher area</h1>
  <div class="lcard"><h3>Create my first class</h3><span class="lbl">Class name</span>${inp('tcn','Example: Period 3 Biology')}${NET.needsSignup?`<span class="lbl">School signup code</span>${inp('tcs','Ask your administrator')}`:''}<button class="btn wide" data-act="tCreate">Create class</button></div>
  <div class="lcard"><h3>I already have a teacher key</h3><span class="lbl">Teacher key</span>${inp('tck','XXXX-XXXX-XXXX-XXXX','style="text-transform:uppercase"')}<button class="btn ghost wide" data-act="tSignIn">Open my classes</button></div>
  ${err}<button class="btn ghost sm" data-act="toLogin" style="align-self:center">Back</button></div>`;
  if(TS.step==='made')return `<div class="join">${mascot('cheer',90)}<h1>${esc(TS.made.name)} is ready!</h1><div class="lcard"><span class="lbl">Class code (give this to students)</span><div class="bigcode">${esc(TS.made.code)}</div>${TS.made.key?`<span class="lbl">Your teacher key (keep this private)</span><div class="keybox">${esc(TS.made.key)}</div><div class="errbox">Save your teacher key now. It is shown only once and cannot be recovered. One key opens all of your classes. This browser will remember it, but write it down too.</div>`:''}<div class="row"><button class="btn ghost sm" data-act="tCopy" data-v="${esc(TS.made.code)}">Copy code</button>${TS.made.key?`<button class="btn ghost sm" data-act="tCopy" data-v="${esc(TS.made.key)}">Copy key</button>`:''}</div><button class="btn wide" data-act="tOpenMade">Open my dashboard</button></div></div>`;
  if(TS.step==='home')return `<div class="tdash"><div class="row" style="justify-content:space-between;align-items:center"><h1>My classes</h1><button class="btn ghost sm" data-act="tOut">Sign out</button></div>
  ${TS.classes.map(c=>`<div class="card" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="flex:1;min-width:160px"><b style="font-size:19px">${esc(c.name)}</b>${c.archived?' <span class="flag new">Archived</span>':''}<div class="sub" style="margin:0">Code ${esc(c.code)} · ${c.students} students${c.active?` · <b style="color:var(--ok-tx)">${c.active} active now</b>`:''}</div></div><button class="btn sm" data-act="tOpenClass" data-code="${esc(c.code)}">Open</button></div>`).join('')}
  <div class="card"><h3>Add a class</h3><span class="lbl">Class name</span>${inp('tcn','Example: Period 5 Biology')}<button class="btn ghost wide" style="margin-top:10px" data-act="tCreate">Create class</button></div>${err}</div>`;
  if(TS.step==='student')return teacherStudentHTML();
  return teacherClassHTML(err);
}

function teacherClassHTML(err){
  const d=TS.data;
  if(!d)return `<div class="tdash"><p class="sub">Loading your class...</p></div>`;
  const tabs=[['overview','Overview'],['students','Students'],['activity','Time'],['insights','Insights'],['manage','Manage']];
  const head=`<div class="tdash"><div class="row" style="justify-content:space-between;align-items:center"><div><h1>${esc(d.class.name)}${d.class.archived?' <span class="flag new">Archived</span>':''}</h1><p class="sub" style="margin:0">Class code <b>${esc(d.class.code)}</b>. Students tap "Join my class" and type it.</p></div>${TS.classes.length>1?`<button class="btn ghost sm" data-act="tHome">All classes</button>`:''}</div>
  <div class="chips" role="tablist">${tabs.map(t=>`<button data-act="tTab" data-v="${t[0]}" aria-pressed="${TS.tab===t[0]}">${t[1]}</button>`).join('')}</div>${err}`;
  const now=tNow(),st=d.students;
  const isLive=s=>s.live&&now-s.live.ts<d.activeMs;
  let body='';
  if(TS.tab==='overview'){
    const act=st.filter(isLive),wsecs=st.reduce((n,s)=>n+s.wsecs,0),avgComp=st.length?Math.round(st.reduce((n,s)=>n+s.comp,0)/st.length):0;
    let c=0,t=0;st.forEach(s=>{c+=s.wc;t+=s.wt});
    const rows=lastDays(14).map(x=>{const r=d.days.find(y=>y.day===x);return{label:dayLabel(x),v:r?r.seconds/60:0,tip:x+': '+(r?fmtDur(r.seconds):'0 sec')}});
    const attn=[];
    st.forEach(s=>{
      if(s.wt>=15&&s.wc/s.wt<.6)attn.push([s,'Accuracy this week is '+Math.round(s.wc/s.wt*100)+'%']);
      else if(!s.items&&!s.secs)attn.push([s,'Has not started yet']);
      else if(s.last_ms&&now-s.last_ms>7*864e5)attn.push([s,'No activity for '+ago(now-s.last_ms).replace(' ago','')]);
    });
    body=`<div class="kpis"><div class="kpi"><small>Students</small><b>${st.length}</b></div><div class="kpi"><small>Active now</small><b>${act.length}</b></div><div class="kpi"><small>Minutes this week</small><b>${fmtMin(wsecs)}</b></div><div class="kpi"><small>Avg minutes per student</small><b>${st.length?fmtMin(wsecs/st.length):0}</b></div><div class="kpi"><small>Average course completion</small><b>${avgComp}%</b></div><div class="kpi"><small>Class accuracy this week</small><b>${t?Math.round(c/t*100)+'%':'-'}</b></div></div>
    <div class="card"><h3>Class minutes per day</h3>${barsSVG(rows)}</div>
    ${act.length?`<div class="card"><h3>Active right now</h3><div class="activechips">${act.map(s=>`<span>${esc(s.avatar||'')} ${esc(s.nick)} · ${esc(s.live.act||'')}</span>`).join('')}</div></div>`:''}
    <div class="card"><h3>Needs attention</h3>${attn.length?attn.map(([s,why])=>`<div class="rev"><span>${esc(s.avatar||'')} <b>${esc(s.nick)}</b><br><small style="color:var(--sub)">${esc(why)}</small></span><button class="btn sm" data-act="tStudent" data-id="${esc(s.id)}">Open</button></div>`).join(''):'<p class="sub" style="margin:0">Nobody needs attention right now.</p>'}</div>`;
  }else if(TS.tab==='students'){
    const rows=st.map(s=>{
      const live=isLive(s),wacc=s.wt?Math.round(s.wc/s.wt*100):null,help=s.wt>=15&&s.wc/s.wt<.6;
      const flag=live?'<span class="flag live">LIVE</span>':help?'<span class="flag help">Needs help</span>':(!s.items&&!s.secs)?'<span class="flag new">Just joined</span>':'';
      return `<tr class="trow" data-act="tStudent" data-id="${esc(s.id)}"><td>${esc(s.avatar||'🙂')} <b>${esc(s.nick)}</b><br>${flag}</td><td>${LV[s.level]?LV[s.level].icon:''}</td><td><div class="mini"><i style="width:${s.comp}%"></i></div>${s.comp}%</td><td>${s.total}</td><td>${fmtDur(s.secs)}</td><td>${fmtDur(s.wsecs)}</td><td>${wacc===null?'-':wacc+'%'}</td><td>${s.days14}/14</td><td>${s.last_ms?ago(now-s.last_ms):'-'}</td></tr>`;
    }).join('');
    body=`<div class="card"><h3>Students</h3>${st.length?`<div class="tblwrap"><table class="tbl" style="min-width:720px"><thead><tr><th>Student</th><th>Level</th><th>Course</th><th>Points</th><th>Total time</th><th>This week</th><th>Week acc.</th><th>Days (14d)</th><th>Last active</th></tr></thead><tbody>${rows}</tbody></table></div><p class="note">Tap a student for full progress, to reset a PIN, or to remove them.</p>`:'<p class="sub" style="margin:0">No students yet. Share the class code.</p>'}</div>`;
  }else if(TS.tab==='activity'){
    const rows=lastDays(14).map(x=>{const r=d.days.find(y=>y.day===x);return{label:dayLabel(x),v:r?r.seconds/60:0,tip:x}});
    const table=d.days.slice().reverse().map(r=>`<tr><td>${r.day}</td><td>${r.students}</td><td>${fmtDur(r.seconds)}</td><td>${r.lessons}</td><td>${r.answers}</td><td>${r.answers?Math.round(r.correct/r.answers*100)+'%':'-'}</td></tr>`).join('');
    const top=st.slice().sort((a,b)=>b.wsecs-a.wsecs).filter(s=>s.wsecs).slice(0,10);
    body=`<div class="card"><h3>Minutes per day (last 14 days)</h3>${barsSVG(rows)}</div>
    <div class="card"><h3>By day</h3>${table?`<div class="tblwrap"><table class="tbl" style="min-width:420px"><thead><tr><th>Day</th><th>Active students</th><th>Time</th><th>Lessons</th><th>Answers</th><th>Accuracy</th></tr></thead><tbody>${table}</tbody></table></div>`:'<p class="sub" style="margin:0">No activity recorded yet.</p>'}</div>
    <div class="card"><h3>Most time this week</h3>${top.map(s=>`<div class="rev"><span>${esc(s.avatar||'')} ${esc(s.nick)}</span><b>${fmtDur(s.wsecs)}</b></div>`).join('')||'<p class="sub" style="margin:0">No time recorded this week.</p>'}</div>
    <p class="note">Time only counts while a student has the app open and is using it (or watching a video). It pauses after 90 seconds without activity.</p>`;
  }else if(TS.tab==='insights'){
    const lv=LVK.map(k=>`<span class="pill">${LV[k].icon} ${LV[k].name}: <b>${st.filter(s=>s.level===k).length}</b></span>`).join(' ');
    body=`<div class="card"><h3>Class accuracy by topic</h3><p class="sub">First-try answers from every student.</p>${topicBars(d.topics)}</div>
    <div class="card"><h3>Hardest questions</h3>${d.hardest.length?d.hardest.map(h=>`<div class="rev"><span><b>${esc(questionText(h.item_id,h.q_index))}</b><br><small style="color:var(--sub)">${esc(itemTitle(h.item_id))} · ${LV[h.level]?LV[h.level].name:''} · ${h.first_tries} students tried</small></span><b style="color:var(--bad-tx)">${Math.round(h.miss_rate*100)}% missed</b></div>`).join(''):'<p class="sub" style="margin:0">Once at least 4 students have answered a question, the ones they miss most will show up here so you can re-teach them.</p>'}</div>
    <div class="card"><h3>Students by level</h3><div class="pills" style="justify-content:flex-start">${lv}</div></div>`;
  }else{
    body=`<div class="card"><h3>Class settings</h3><div class="row"><button class="btn ghost sm" data-act="tRename">Rename class</button><button class="btn ghost sm" data-act="tArchive">${d.class.archived?'Restore class':'Archive class'}</button><button class="btn ghost sm" data-act="tCopy" data-v="${esc(d.class.code)}">Copy class code</button></div><p class="note">Archiving stops students from joining or saving new progress, but keeps every record.</p></div>
    <div class="card"><h3>Download data (CSV)</h3><div class="row"><button class="btn ghost sm" data-act="tExport" data-v="students">Students</button><button class="btn ghost sm" data-act="tExport" data-v="minutes">Minutes by day</button><button class="btn ghost sm" data-act="tExport" data-v="attempts">All lesson attempts</button></div></div>
    <div class="card"><h3>Teacher account</h3><div class="row"><button class="btn ghost sm" data-act="tNewClass">Add another class</button><button class="btn ghost sm" data-act="tOut">Sign out</button></div></div>
    <div class="card"><h3>Activity log</h3>${TS.audit?(TS.audit.length?TS.audit.map(a=>`<div class="rev"><span>${esc(auditText(a))}</span><small style="color:var(--sub)">${ago(tNow()-a.ms)}</small></div>`).join(''):'<p class="sub" style="margin:0">Nothing yet.</p>'):'<p class="sub" style="margin:0">Loading...</p>'}</div>
    <p class="note">Student names are generated animal names. Do not ask students to enter real names. Data is stored in your site's Netlify Database.</p>`;
    if(!TS.audit)tApi('teacher/audit').then(j=>{TS.audit=j.entries;if(screen==='teacher'&&TS.step==='class'&&TS.tab==='manage'&&!modalOpen())render()}).catch(()=>{});
  }
  return head+body+'</div>';
}
function auditText(a){
  const d=a.detail||{};
  return ({'class.created':()=>'Class created','class.renamed':()=>`Renamed from "${d.from}" to "${d.to}"`,'class.archived':()=>'Class archived','class.restored':()=>'Class restored','student.pin_reset':()=>`PIN reset for ${d.nick||'a student'}`,'student.removed':()=>`Removed ${d.nick||'a student'} from the class`}[a.action]||(()=>a.action))();
}

function teacherStudentHTML(){
  const r=TS.st;
  const back=`<button class="btn ghost sm" data-act="tBack">Back to class</button>`;
  if(!r)return `<div class="tdash"><div class="row">${back}</div><p class="sub">Loading...</p></div>`;
  const s=r.student,pts=s.pb+s.pi+s.px;
  const map={};r.days.forEach(d=>map[d.day]=d);
  const rows=lastDays(30).map(d=>({label:dayLabel(d),v:map[d]?map[d].seconds/60:0,tip:d+': '+fmtDur(map[d]?map[d].seconds:0)}));
  let c=0,t=0;r.topics.forEach(x=>{c+=x.correct;t+=x.total});
  const steps=r.items.map(i=>`<tr><td>${esc(itemTitle(i.item_id))}</td><td>${LV[i.level]?LV[i.level].icon:''}</td><td>${i.completed?'✅ Done':'In progress'}</td><td>${i.best_accuracy!=null?Math.round(i.best_accuracy*100)+'%':'-'}</td><td>${i.attempts}</td><td>${fmtDur(i.seconds_total)}</td><td>${i.points_total}</td></tr>`).join('');
  const att=r.attempts.slice(0,15).map(a=>`<tr><td>${new Date(a.at_ms).toLocaleString()}</td><td>${esc(itemTitle(a.item_id))}</td><td>${Math.round(a.accuracy*100)}%</td><td>${fmtDur(a.seconds)}</td><td>${a.completed?'+'+a.points:'Out of hearts'}</td></tr>`).join('');
  return `<div class="tdash"><div class="row" style="justify-content:space-between;align-items:center">${back}<div class="row"><button class="btn ghost sm" data-act="tResetPin" data-id="${esc(s.id)}">Reset PIN</button><button class="btn bad sm" data-act="tRemove" data-id="${esc(s.id)}">Remove</button></div></div>
  <h1 style="margin-top:14px">${esc(s.avatar||'')} ${esc(s.nick)}</h1><p class="sub">${LV[s.level]?LV[s.level].name+' · '+LV[s.level].grade:''} · joined ${new Date(s.created_ms).toLocaleDateString()} · last active ${s.last_ms?ago(tNow()-s.last_ms):'never'}</p>
  <div class="kpis"><div class="kpi"><small>Total time in app</small><b>${fmtDur(r.totals.seconds)}</b></div><div class="kpi"><small>Days active</small><b>${r.totals.daysActive}</b></div><div class="kpi"><small>Visits</small><b>${r.totals.sessions}</b></div><div class="kpi"><small>Points</small><b>⭐ ${pts}</b></div><div class="kpi"><small>First-try accuracy</small><b>${t?Math.round(c/t*100)+'%':'-'}</b></div><div class="kpi"><small>Stickers</small><b>${r.badges.length}</b></div></div>
  <div class="card"><h3>Minutes per day (last 30 days)</h3>${barsSVG(rows)}</div>
  <div class="card"><h3>Course progress</h3>${levelBars(r.items)}</div>
  <div class="card"><h3>Accuracy by topic</h3>${topicBars(r.topics)}</div>
  <div class="card"><h3>Every step</h3>${steps?`<div class="tblwrap"><table class="tbl" style="min-width:560px"><thead><tr><th>Step</th><th>Level</th><th>Status</th><th>Best</th><th>Tries</th><th>Time</th><th>Points</th></tr></thead><tbody>${steps}</tbody></table></div>`:'<p class="sub" style="margin:0">No steps started yet.</p>'}</div>
  <div class="card"><h3>Recent lesson attempts</h3>${att?`<div class="tblwrap"><table class="tbl" style="min-width:520px"><thead><tr><th>When</th><th>Lesson</th><th>First try</th><th>Time</th><th>Result</th></tr></thead><tbody>${att}</tbody></table></div>`:'<p class="sub" style="margin:0">No attempts yet.</p>'}</div></div>`;
}

/* ---------- actions ---------- */
ACT.tCreate=async()=>{
  try{
    const j=await api('teacher/create',{name:FORM.tcn||'',signup:FORM.tcs||'',key:TS.key||''});
    TS.made={code:j.code,name:j.name,key:j.teacherKey||''};
    if(j.teacherKey){TS.key=j.teacherKey;lsSet(TKEY,{key:TS.key})}
    TS.err='';TS.step='made';FORM.tcn='';
  }catch(e){TS.err=netMsg(e)}
  render();
};
ACT.tSignIn=()=>tLogin((FORM.tck||'').trim());
ACT.tOpenMade=async()=>{try{TS.classes=(await api('teacher/login',{key:TS.key})).classes}catch(e){}tOpen(TS.made.code,'overview')};
ACT.tOpenClass=(t,d)=>tOpen(d.code,'overview');
ACT.tHome=()=>{clearInterval(tcTimer);tLogin(TS.key)};
ACT.tTab=(t,d)=>{TS.tab=d.v;TS.err='';render()};
ACT.tStudent=(t,d)=>tOpenStudent(d.id);
ACT.tBack=()=>{TS.step='class';render()};
ACT.tExport=(t,d)=>tDownload(d.v);
ACT.tCopy=(t,d)=>{try{navigator.clipboard.writeText(d.v);t.textContent='Copied!'}catch(e){t.textContent=d.v}};
ACT.tOut=()=>{lsSet(TKEY,null);clearInterval(tcTimer);TS=Object.assign(TS,{step:'menu',key:'',err:'',made:null,data:null,st:null,classes:[]});render()};
ACT.tNewClass=()=>{clearInterval(tcTimer);TS.step='home';render()};
ACT.tRename=()=>modal('<div class="sheet"><h2>Rename class</h2><input class="input" id="rn" maxlength="40" value="'+esc(TS.data.class.name)+'"><div class="row"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn" data-act="tDoRename">Save</button></div></div>');
ACT.tDoRename=async()=>{const v=(document.getElementById('rn')||{}).value||'';try{await tApi('teacher/rename',{name:v});closeModal();TS.audit=null;await tRefresh()}catch(e){closeModal();TS.err=netMsg(e);render()}};
ACT.tArchive=async()=>{try{await tApi('teacher/archive',{archived:!TS.data.class.archived});TS.audit=null;await tRefresh()}catch(e){TS.err=netMsg(e);render()}};
ACT.tResetPin=(t,d)=>modal('<div class="sheet"><h2>Reset PIN</h2><p>Type a new 4-number PIN. Tell the student in person. They will be signed out of every device.</p><input class="input" id="np" inputmode="numeric" maxlength="4" placeholder="4 numbers"><div class="row"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn" data-act="tDoPin" data-id="'+esc(d.id)+'">Save PIN</button></div></div>');
ACT.tDoPin=async(t,d)=>{const v=(document.getElementById('np')||{}).value||'';try{await tApi('teacher/resetpin',{id:d.id,pin:v});closeModal();modal('<div class="sheet"><h2>PIN changed</h2><p>The student can now log in with the new PIN.</p><button class="btn wide" data-act="closeModal">Done</button></div>')}catch(e){const sh=document.querySelector('#modal .sheet');sh&&sh.classList.add('shake');setTimeout(()=>sh&&sh.classList.remove('shake'),400)}};
ACT.tRemove=(t,d)=>modal('<div class="sheet"><h2>Remove this student?</h2><p>They will be removed from the class and signed out. Their records stay in your database.</p><div class="row"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn bad" data-act="tDoRemove" data-id="'+esc(d.id)+'">Remove</button></div></div>');
ACT.tDoRemove=async(t,d)=>{try{await tApi('teacher/remove',{id:d.id});closeModal();TS.audit=null;TS.step='class';await tRefresh()}catch(e){closeModal()}};
