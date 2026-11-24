/* ----- Ranks ----- */
function rowsFor(){
  const wk=weekKey();let a=BOARD.slice();
  if(rankKind==='pts'){
    const val=r=>rankLv==='all'?(r.total||0):((r.pts||{})[rankLv]||0);
    return a.filter(r=>val(r)>0).sort((x,y)=>val(y)-val(x)).map(r=>Object.assign({},r,{v:val(r)}));
  }
  return a.filter(r=>r.wk===wk&&r.wt>=MINQ).map(r=>Object.assign({},r,{acc:r.wc/r.wt})).sort((x,y)=>y.acc-x.acc||y.wt-x.wt);
}
function ranksHTML(){
  let h=`<h1 class="pt">Leaderboards</h1>`;
  if(!remote())return h+`<div class="card" style="text-align:center">${mascot('happy',90)}<h3 style="margin-top:8px">Sign in to join</h3><p class="sub">Guests are not on the leaderboards. Log out and join your class (or sign in) to appear here.</p></div>`;
  h+=`<div class="seg" role="group" aria-label="Leaderboard type"><button data-act="rankKind" data-v="pts" aria-pressed="${rankKind==='pts'}">⭐ Points</button><button data-act="rankKind" data-v="acc" aria-pressed="${rankKind==='acc'}">🎯 Weekly accuracy</button></div>`;
  if(cloudNote)h+=`<div class="banner">${esc(cloudNote)}</div>`;
  const rows=rowsFor();
  if(rankKind==='pts'){
    h+=`<div class="chips" role="group" aria-label="Level filter">${['all',...LVK].map(k=>`<button data-act="rankLv" data-v="${k}" aria-pressed="${rankLv===k}">${k==='all'?'All levels':LV[k].icon+' '+LV[k].name}</button>`).join('')}</div><p class="sub">${rankLv==='all'?'Total points across every level.':'Points earned at '+LV[rankLv].name+' level. Harder levels give more points per answer.'}</p>`;
  }else{
    h+=`<p class="sub" style="margin-top:12px">Correct answers divided by all answers this week. Answer at least ${MINQ} questions to be ranked. The week resets on Monday (${daysLeftInWeek()} day${daysLeftInWeek()===1?'':'s'} left).</p>`;
    const t=S.week.k===weekKey()?S.week.t:0;
    if(t<MINQ)h+=`<div class="banner">You have answered ${t} of ${MINQ} questions this week. ${MINQ-t} more to join the board!</div>`;
  }
  const meIdx=rows.findIndex(r=>r.id===UID),show=rows.slice(0,20);
  const row=(r,i)=>`<div class="brow ${r.id===UID?'me':''}"><div class="rk">${i<3?['🥇','🥈','🥉'][i]:i+1}</div><div class="av" aria-hidden="true">${esc(r.avatar||'🙂')}</div><div class="nm">${esc(r.nick||'Explorer')}${r.id===UID?' (you)':''}<small>${LV[r.level]?LV[r.level].icon+' '+LV[r.level].name:''}</small></div><div class="val">${rankKind==='pts'?r.v+' pts':Math.round(r.acc*100)+'%'}${rankKind==='acc'?`<small style="display:block;font-size:12px;color:var(--sub)">${r.wt} answers</small>`:''}</div></div>`;
  h+=`<div class="board">${show.length?show.map(row).join(''):'<div class="empty">Nobody is on this board yet. Be the first!</div>'}${meIdx>=20?row(rows[meIdx],meIdx):''}</div>`;
  return h;
}
