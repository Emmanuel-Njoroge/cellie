/* ================= LESSON ENGINE ================= */
function prep(q){
  const c={q,done:false,ok:null,sel:null,held:null};
  if(q.t==='match'){c.left=shuffle(q.pairs.map((_,i)=>i));c.right=shuffle(q.pairs.map((_,i)=>i));c.matched=[];c.pickL=null;c.pickR=null;c.err=0;c.shake=null}
  if(q.t==='order'){let b;do{b=shuffle(q.items.map((_,i)=>i))}while(b.length>1&&b.every((v,i)=>v===i));c.bank=b;c.placed=[]}
  if(q.t==='choice')c.order=shuffle(q.opts.map((_,i)=>i));
  if(q.t==='sort'){c.order=shuffle(q.items.map((_,i)=>i));c.placed={}}
  if(q.t==='fill'){c.order=shuffle(q.bank.map((_,i)=>i));c.fillSel=null}
  return c;
}
function startLesson(ui,li,lv){
  closeModal();lv=lv||S.level;
  const u=UNITS[ui],l=lessonsFor(u,lv)[li];
  const qs=l.qs.map((q,qi)=>Object.assign({},q,{retry:false,qi}));
  L={lv,ui,li,u,l,queue:qs,i:0,hearts:3,first:0,solved:0,total:qs.length,screen:'learn',cur:null,startedAt:Date.now(),clientId:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,9),log:[]};
  act=u.title+': '+l.title;actQ={qa:0,qt:qs.length};liveBeat(true);
  renderLesson();
}
const praises=['Great job!','Super!','You got it!','Brilliant!','Awesome!','Nice one!'];
function ans(q){
  if(q.t==='choice')return q.opts[q.a];
  if(q.t==='tf')return q.a?'True':'False';
  if(q.t==='order')return q.items.join(', then ');
  if(q.t==='fill')return q.bank[q.a];
  if(q.t==='sort')return q.zones.map((z,zi)=>z+': '+q.items.filter(it=>it[1]===zi).map(it=>it[0]).join(', ')).join('. ');
  return '';
}
const sortItemsIn=(c,z)=>c.order.filter(i=>c.placed[i]===z);
function canCheck(c){
  const q=c.q;
  if(q.t==='choice'||q.t==='tf')return c.sel!==null;
  if(q.t==='order')return c.placed.length===q.items.length;
  if(q.t==='sort')return q.items.every((_,i)=>c.placed[i]!==undefined);
  if(q.t==='fill')return c.fillSel!==null;
  return false;
}
function chip(label,id,from,cls,dis){return `<button class="chip dd ${cls||''}${L.cur.held===id&&from==='tray'?' held':''}" data-id="${id}" data-from="${from}" ${dis?'disabled':''}>${esc(label)}</button>`}

function bodyHTML(c){
  const q=c.q,lv=L.lv;let h='';
  const speakBtn=lv==='b'&&canSpeak()?`<button class="iconbtn" data-act="speak" aria-label="Read the question aloud">🔊</button>`:'';
  if(q.t==='choice'||q.t==='tf'){
    h+=`<h1 class="instr">${q.t==='tf'?'True or false?':'Choose the right answer'}</h1><div class="say">${mascot('happy',84)}<div class="bubble">${esc(q.q)}</div>${speakBtn}</div>`;
    const opts=q.t==='tf'?[{i:true,txt:'True',ic:'👍 '},{i:false,txt:'False',ic:'👎 '}]:c.order.map(i=>({i,txt:q.opts[i],ic:''}));
    h+='<div class="opts" style="display:flex;flex-direction:column;gap:12px">'+opts.map((o,k)=>{let cls='opt';if(c.done){if(o.i===q.a)cls+=' right';else if(c.sel===o.i)cls+=' wrong'}else if(c.sel===o.i)cls+=' sel';return `<button class="${cls} k${q.t==='tf'?(o.i?1:0):k%4}" data-act="pick" data-v="${o.i}" ${c.done?'disabled':''}><span class="num">${['▲','◆','●','■'][q.t==='tf'?(o.i?2:0):k%4]}</span>${o.ic}${esc(o.txt)}</button>`}).join('')+'</div>';
  }else if(q.t==='match'){
    const side=(arr,col)=>arr.map(i=>{const m=c.matched.includes(i),pk=(col===0?c.pickL:c.pickR)===i,bad=c.shake&&(col===0?c.shake.l:c.shake.r)===i;return `<button class="opt${m?' right gone':''}${pk?' sel':''}${bad?' wrong':''}" data-act="${col===0?'ml':'mr'}" data-v="${i}" ${m||c.done?'disabled':''}>${esc(q.pairs[i][col])}</button>`}).join('');
    h+=`<h1 class="instr">${esc(q.q)} ${speakBtn}</h1><div class="match"><div>${side(c.left,0)}</div><div>${side(c.right,1)}</div></div>`;
  }else if(q.t==='order'){
    h+=`<h1 class="instr">${esc(q.q)} ${speakBtn}</h1><div class="answer" aria-label="Your answer">${c.placed.map((i,k)=>`<button class="chip" data-act="unplace" data-v="${k}" ${c.done?'disabled':''}>${esc(q.items[i])}</button>`).join('')}</div><div class="bank">${c.bank.map(i=>c.placed.includes(i)?`<span class="chip ghost">${esc(q.items[i])}</span>`:`<button class="chip" data-act="place" data-v="${i}" ${c.done?'disabled':''}>${esc(q.items[i])}</button>`).join('')}</div>`;
  }else if(q.t==='sort'){
    h+=`<h1 class="instr">${esc(q.q)} ${speakBtn}</h1><p class="sub">Drag each card into a box, or tap a card and then tap a box.</p><div class="zones">${q.zones.map((z,zi)=>`<div class="zone" data-zone="${zi}"><h3>${esc(z)}</h3>${sortItemsIn(c,zi).map(i=>chip(q.items[i][0],i,String(zi),c.done?(q.items[i][1]===zi?'right':'wrong'):'',c.done)).join('')}</div>`).join('')}</div><div class="tray" data-zone="tray">${c.order.filter(i=>c.placed[i]===undefined).map(i=>chip(q.items[i][0],i,'tray','',c.done)).join('')}</div>`;
  }else if(q.t==='fill'){
    const parts=q.q.split('___');
    const blank=c.fillSel===null?'':chip(q.bank[c.fillSel],c.fillSel,'blank',c.done?(c.fillSel===q.a?'right':'wrong'):'',c.done);
    h+=`<h1 class="instr">Fill in the blank ${speakBtn}</h1><p class="sub">Drag a word into the blank, or tap a word and then tap the blank.</p><div class="fillq">${esc(parts[0])}<span class="blank" data-zone="0">${blank}</span>${esc(parts[1]||'')}</div><div class="tray" data-zone="tray">${c.order.filter(i=>i!==c.fillSel).map(i=>chip(q.bank[i],i,'tray','',c.done)).join('')}</div>`;
  }
  return h;
}

function renderLesson(){
  const el=$('#lesson');
  if(!L){el.hidden=true;el.innerHTML='';return}
  el.hidden=false;
  if(L.screen==='learn'){
    el.innerHTML=`<div class="lh"><button class="xbtn" data-act="leave" aria-label="Close">✕</button><div class="bar"><i style="width:0%"></i></div><span class="hearts">${LV[L.lv].icon}</span></div><div class="lb">${learnBody(L.l,L.lv)}</div><div class="lf"><div class="in"><button class="btn" data-act="learnGo">Start the quiz</button></div></div>`;return;
  }
  if(L.screen==='lost'){
    el.innerHTML=`<div class="center">${mascot('sad',140)}<h1>Out of hearts!</h1><p>Every scientist makes mistakes. Read the guide again, then try the lesson once more.</p><button class="btn wide" data-act="retryLesson">Try again</button><button class="btn ghost wide" data-act="leave">Back to the path</button></div>`;return;
  }
  if(L.screen==='done'){
    const r=L.res,nb=r.newB.map(id=>BADGES.find(b=>b.id===id)).filter(Boolean);
    const conf=Array.from({length:26},()=>`<span style="left:${Math.random()*100}%;animation-delay:${(Math.random()*1.4).toFixed(2)}s">${pick(['🎉','✨','⭐','🧬','💚'])}</span>`).join('');
    el.innerHTML=`<div class="center"><div class="conf" aria-hidden="true">${conf}</div>${mascot('cheer',140)}<h1>${r.perfect?'Perfect lesson!':'Lesson complete!'}</h1><div class="stats"><div class="stat" style="--c:var(--gold-d)"><b>Points</b><span>⭐ ${r.pts}</span></div><div class="stat" style="--c:var(--ok-d)"><b>Accuracy</b><span>🎯 ${Math.round(r.acc*100)}%</span></div><div class="stat" style="--c:var(--accent-d)"><b>Stars</b><span>${'⭐'.repeat(r.stars)}</span></div></div><div class="fact"><b>Did you know?</b><p>${esc(L.l.fact)}</p></div>${nb.map(b=>`<div class="newb"><span class="em">${b.icon}</span><div><b>New sticker: ${esc(b.name)}</b><div style="font-size:14px;font-weight:700">Check your sticker book!</div></div></div>`).join('')}<button class="btn wide" data-act="leave">Continue</button></div>`;return;
  }
  const c=L.cur,q=c.q,can=canCheck(c);
  let foot;
  if(!c.done)foot=`<div class="lf"><div class="in"><button class="btn" data-act="check" ${can?'':'disabled'}>Check</button></div></div>`;
  else{const a=ans(q),txt=(c.ok?'':(a&&q.t!=='match'?'Answer: '+a+'. ':''))+(q.why||'');foot=`<div class="lf ${c.ok?'ok':'bad'}" role="status"><div class="in"><div class="fb"><h3>${c.ok?c.praise:(q.t==='match'?'Almost there!':'Not quite')}</h3><p>${esc(txt)}</p></div><button class="btn ${c.ok?'':'bad'}" data-act="cont">Continue</button></div></div>`}
  el.innerHTML=`<div class="lh"><button class="xbtn" data-act="quit" aria-label="Leave lesson">✕</button><div class="bar" role="progressbar" aria-valuenow="${L.solved}" aria-valuemin="0" aria-valuemax="${L.total}"><i style="width:${Math.round(L.solved/L.total*100)}%"></i></div><button class="iconbtn" data-act="hint" aria-label="Open the guide">💡</button><span class="hearts" aria-label="${L.hearts} hearts left">❤️ ${L.hearts}</span></div><div class="lb">${bodyHTML(c)}</div>${foot}`;
}

function answer(ok){
  const c=L.cur,q=c.q;
  c.done=true;c.ok=ok;c.praise=pick(praises);
  L.log.push({i:q.qi,t:q.t,ok:!!ok,r:!!q.retry});
  const id=L.u.id;S.stats[id]=S.stats[id]||{c:0,t:0};
  if(S.week.k!==weekKey())S.week={k:weekKey(),c:0,t:0};
  S.week.t++;if(ok)S.week.c++;
  if(!q.retry){S.stats[id].t++;if(ok)S.stats[id].c++}
  if(ok){L.solved++;if(!q.retry)L.first++;sfx.good();SS.qc++;SS.run++}
  else{L.hearts=Math.max(0,L.hearts-1);L.queue.push(Object.assign({},q,{retry:true}));sfx.bad();SS.run=0}
  SS.qa++;actQ.qa=L.solved;
  saveLocal();renderLesson();liveBeat();
}
function check(){
  const c=L.cur,q=c.q;if(c.done||!canCheck(c))return;
  if(q.t==='choice'||q.t==='tf')answer(c.sel===q.a);
  else if(q.t==='order')answer(c.placed.every((v,i)=>v===i));
  else if(q.t==='sort')answer(q.items.every((it,i)=>c.placed[i]===it[1]));
  else if(q.t==='fill')answer(c.fillSel===q.a);
}
function cont(){
  const c=L.cur;
  if(L.hearts<=0&&!c.ok){recordAttempt(false);L.screen='lost';persist(true);renderLesson();return}
  L.i++;
  if(L.i>=L.queue.length){finish();return}
  L.cur=prep(L.queue[L.i]);renderLesson();
  const lb=document.querySelector('#lesson .lb');lb&&(lb.scrollTop=0);
}
function finish(){
  const m=MULT[L.lv],acc=L.first/L.total,perfect=acc===1;
  const pts=(L.first*2+5+(perfect?5:0))*m,stars=perfect?3:acc>=.8?2:1;
  const before=earned();
  awardPts(pts,L.lv);
  const p=S.done[L.l.id]||{best:0,stars:0,plays:0};
  S.done[L.l.id]={best:Math.max(p.best,acc),acc,stars:Math.max(p.stars,stars),plays:p.plays+1};
  const after=earned();
  L.res={acc,pts,perfect,stars,newB:after.filter(id=>!before.includes(id))};
  S.badges=after;recordAttempt(true);
  L.screen='done';persist(true);sfx.win();renderLesson();act='On the path';actQ={qa:0,qt:0};liveBeat(true);
}
function leave(){const had=L;L=null;act='On the path';actQ={qa:0,qt:0};liveBeat(true);renderLesson();if(had&&had.screen!=='done')persist(true);tab='learn';render();window.scrollTo(0,0)}
function matchResolve(c){
  if(c.pickL===null||c.pickR===null)return;
  if(c.pickL===c.pickR){
    c.matched.push(c.pickL);c.pickL=c.pickR=null;sfx.tick();
    if(c.matched.length===c.q.pairs.length){answer(c.err===0);return}
    renderLesson();
  }else{
    c.err++;c.shake={l:c.pickL,r:c.pickR};c.pickL=c.pickR=null;sfx.bad();renderLesson();
    setTimeout(()=>{c.shake=null;if(L&&L.cur===c&&!c.done)renderLesson()},550);
  }
}

function awardPts(pts,lv){
  S.pts[lv]+=pts;S.days[today()]=(S.days[today()]||0)+pts;SS.pts+=pts;
  if(S.last!==today()){S.streak=(S.last===yday())?S.streak+1:1;S.last=today()}
  S.bestStreak=Math.max(S.bestStreak,S.streak);
}
