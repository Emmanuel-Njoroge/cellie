/* ================= STATE ================= */
const KEY='cellie-v2';
const defaults=()=>({nick:'',avatar:'🦊',level:'b',pts:{b:0,i:0,x:0},streak:0,bestStreak:0,last:'',days:{},done:{},cur:{},stats:{},week:{k:'',c:0,t:0},sound:true,theme:{mode:'auto',pal:'Meadow',custom:'',mono:false},time:{total:0,days:{}},hist:[]});
function fix(o){const d=defaults();o=Object.assign(d,o||{});o.pts=Object.assign(d.pts,o.pts||{});o.theme=Object.assign(d.theme,o.theme||{});o.week=Object.assign(d.week,o.week||{});o.time=Object.assign({total:0,days:{}},o.time||{});if(!o.time.days||typeof o.time.days!=='object')o.time.days={};if(!Array.isArray(o.hist))o.hist=[];if(!LV[o.level])o.level='b';return o}
let mem=null;
function loadLocal(){try{const r=localStorage.getItem(KEY);if(r)return fix(JSON.parse(r))}catch(e){}return mem?fix(mem):defaults()}
function saveLocal(){mem=S;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
let S=loadLocal();
let screen='login',session=null,tab='learn',meView='home',gate=false,L=null;
let NET={ok:false,checked:false,needsSignup:false},CLS=null,SKEW=0;
let LIVE=[],SS={pts:0,qa:0,qc:0,run:0},act='On the path',actQ={qa:0,qt:0},liveOn=false,liveT=null,lastBeat=0,RD=null,VD=null,vt=null;
let cloud='checking',DB=null,UID=null,cloudBlocked=false,cloudNote='',BOARD=[],boardOn=false,rankKind='pts',rankLv='all';
let su={nick:'',avatar:'🦊',level:'b',pal:'Meadow',opts:[]};
const total=()=>S.pts.b+S.pts.i+S.pts.x;
const curStreak=()=>(S.last===today()||S.last===yday())?S.streak:0;
const isDone=l=>!!S.done[l.id];
const mult=()=>MULT[S.level];
const unlocked=(arr,gi)=>gi===0||isDone(arr[gi-1].l);
const goalPts=()=>30*mult();

const BADGES=[
 ...UNITS.map(u=>({id:'u-'+u.id,icon:u.sticker,name:u.stickerName,hint:'Finish all 3 '+u.title+' lessons (including the challenge) at any level',test:()=>LVK.some(k=>lessonsFor(u,k).every(isDone))})),
 {id:'first',icon:'🚀',name:'Lift-off',hint:'Finish your first lesson',test:()=>Object.keys(S.done).length>=1},
 {id:'perfect',icon:'🎯',name:'Bullseye',hint:'Get every answer right in a lesson',test:()=>Object.values(S.done).some(d=>d.best>=1)},
 {id:'streak3',icon:'🔥',name:'On Fire',hint:'Learn 3 days in a row',test:()=>S.bestStreak>=3},
 {id:'pts100',icon:'⚡',name:'Power Up',hint:'Earn 100 points',test:()=>total()>=100},
 {id:'sharp',icon:'🏹',name:'Sharp Shooter',hint:'Score 90% or more this week (15+ answers)',test:()=>S.week.k===weekKey()&&S.week.t>=MINQ&&S.week.c/S.week.t>=.9},
 ...LVK.map(k=>({id:'m-'+k,icon:LV[k].icon,name:LV[k].name+' Master',hint:'Finish every '+LV[k].name+' lesson',test:()=>allFor(k).every(x=>isDone(x.l))}))
];
const earned=()=>BADGES.filter(b=>b.test()).map(b=>b.id);
