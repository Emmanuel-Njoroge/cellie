/* ================= TIME TRACKING (minutes in the app) ================= */
// Counts a second only while the page is visible AND the student is interacting
// (or a video is playing). Totals are kept on this device for everyone; class students also
// send a small "I was active for N seconds" ping to the database about every 20 seconds.
const SESSION_ID=Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const PING_SEC=window.__PING_SEC||20,IDLE_MS=90000;
let lastInput=Date.now(),pendingSec=0,pingBusy=false;
['pointerdown','keydown','touchstart','wheel','scroll'].forEach(ev=>addEventListener(ev,()=>{lastInput=Date.now()},{passive:true,capture:true}));
const isLearningScreen=()=>(!!S.nick&&screen==='home')||!!L||!!RD||!!VD;
function isActive(){
  if(document.hidden)return false;
  if(VD&&VD.playing)return true;
  return Date.now()-lastInput<IDLE_MS;
}
function trackTick(){
  if(!isLearningScreen()||!isActive())return;
  const d=today();
  S.time.total++;S.time.days[d]=(S.time.days[d]||0)+1;
  if(session==='class')pendingSec++;
  if(S.time.total%15===0)saveLocal();
  if(pendingSec>=PING_SEC)flushTime();
}
async function flushTime(force){
  if(session!=='class'||!CLS||pingBusy||pendingSec<=0)return;
  const delta=Math.min(pendingSec,60);pingBusy=true;
  try{
    await api('student/activity',{code:CLS.code,id:CLS.id,token:CLS.token,sessionId:SESSION_ID,delta,level:S.level,day:today(),act},force?{keepalive:true}:undefined);
    pendingSec-=delta;
  }catch(e){if(e.status===401||e.status===403)pendingSec=0}
  finally{pingBusy=false}
}
setInterval(trackTick,1000);
const timeToday=()=>S.time.days[today()]||0;
const timeThisWeek=()=>{const wk=weekKey();return Object.keys(S.time.days).filter(d=>d>=wk).reduce((n,d)=>n+S.time.days[d],0)};
