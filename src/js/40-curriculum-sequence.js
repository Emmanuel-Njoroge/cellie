/* ================= CURRICULUM SEQUENCE ================= */
function seqFor(lv){
  const out=[];
  UNITS.forEach((u,ui)=>{
    out.push({kind:'book',u,ui,id:'book-'+u.id+'-'+lv,title:u.book[lv].short,icon:'📖'});
    out.push({kind:'video',u,ui,id:'vid-'+u.id+'-'+lv,title:'Video: '+u.book[lv].short,icon:'🎬'});
    lessonsFor(u,lv).forEach((l,li)=>out.push({kind:li===2?'challenge':'lesson',u,ui,li,l,id:l.id,title:l.title,icon:li===2?'⚡':u.icon}));
    out.push({kind:'sticker',u,ui,id:'st-'+u.id+'-'+lv,title:u.stickerName+' sticker',icon:u.sticker});
  });
  return out;
}
function seqState(lv){
  const seq=seqFor(lv);
  seq.forEach((it,i)=>{
    it.open=i===0||seq[i-1].done;
    if(it.kind==='book'||it.kind==='video')it.done=!!S.cur[it.id];
    else if(it.kind==='sticker')it.done=seq.filter(x=>x.ui===it.ui&&x.kind!=='sticker').every(x=>x.done);
    else it.done=isDone(it.l);
  });
  return seq;
}
const completion=()=>{const q=seqState(S.level).filter(x=>x.kind!=='sticker');return Math.round(q.filter(x=>x.done).length/q.length*100)};
