/* ================= PROGRESS RECORDS (attempts, chapters, videos -> database) ================= */
// Every finished lesson run, chapter and video is saved on this device (S.hist, S.cur) and, for class
// students, queued for the database. The queue survives offline use and page reloads.
const OUTKEY='cellie-outbox';
const outbox=()=>lsGet(OUTKEY)||[];
function queuePost(path,extra){
  if(session!=='class'||!CLS)return;
  const o=outbox();o.push({path,extra,id:CLS.id,at:Date.now()});lsSet(OUTKEY,o.slice(-80));flushOutbox();
}
let outBusy=false;
async function flushOutbox(){
  if(outBusy||session!=='class'||!CLS)return;
  outBusy=true;
  try{
    let o=outbox();
    for(const it of o.slice()){
      if(it.id!==CLS.id)continue;                                   // belongs to another student on this device
      try{await api(it.path,Object.assign({code:CLS.code,id:CLS.id,token:CLS.token},it.extra));o=o.filter(x=>x!==it)}
      catch(e){if(e.status&&e.status<500&&e.status!==401&&e.status!==429)o=o.filter(x=>x!==it);else break}
    }
    lsSet(OUTKEY,o);
  }finally{outBusy=false}
}
setInterval(flushOutbox,15000);
addEventListener('online',()=>flushOutbox());
function recordAttempt(completed){
  if(!L)return;
  const sec=Math.min(3600,Math.round((Date.now()-L.startedAt)/1000));
  const a={clientId:L.clientId,itemId:L.l.id,startedAt:L.startedAt,durationSec:sec,total:L.total,firstTry:L.first,hearts:L.hearts,completed,day:today(),answers:L.log};
  S.hist.unshift({id:a.clientId,at:Date.now(),item:a.itemId,level:L.lv,acc:L.first/L.total,total:L.total,sec,done:completed,pts:completed&&L.res?L.res.pts:0});
  S.hist=S.hist.slice(0,60);
  queuePost('student/attempt',{attempt:a});
}
function recordItem(it,sec,first){
  S.hist.unshift({id:'i'+Date.now(),at:Date.now(),item:it.id,level:S.level,acc:null,total:0,sec,done:true,pts:first?5*mult():0});
  S.hist=S.hist.slice(0,60);
  queuePost('student/item',{item:{itemId:it.id,seconds:sec,day:today()}});
}
