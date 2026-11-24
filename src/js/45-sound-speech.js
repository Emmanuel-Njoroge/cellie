/* ================= SOUND & SPEECH ================= */
let ac=null;
function beep(f,d=.12,type='sine',t0=0,v=.07){
  if(!S.sound)return;
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+t0;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+d)}catch(e){}
}
const sfx={good:()=>{beep(660,.1);beep(880,.16,'sine',.09)},bad:()=>beep(200,.25,'triangle',0,.1),tick:()=>beep(520,.05,'sine',0,.04),win:()=>{[523,659,784,1047].forEach((f,i)=>beep(f,.18,'sine',i*.11))}};
const canSpeak=()=>'speechSynthesis' in window;
function speak(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(t).replace(/___/g,'blank'));u.rate=.9;speechSynthesis.speak(u)}catch(e){}}
