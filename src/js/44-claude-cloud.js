/* ================= CLOUD (claude.ai identity + shared db) ================= */
async function initCloud(){
  try{
    if(!(window.claude&&claude.use)){cloud='none';return}
    const user=await claude.use('user'),db=await claude.use('db');
    if(!user||!db){cloud='none';return}
    const id=await user.id();
    if(!id){cloud='none';return}
    UID=id;DB=db;cloud='ready';
    try{if(await user.can('data.write')===false){cloudBlocked=true;cloudNote='This link lets you read the leaderboards but not save. Ask the grown-up who shared it to give you Contributor access.'}}catch(e){}
  }catch(e){cloud='none'}
  finally{if(screen==='login')render()}
}
let syncTimer=null,syncBusy=false,syncAgain=false;
const snap=o=>JSON.parse(JSON.stringify(o));
const boardDoc=()=>({nick:S.nick,avatar:S.avatar,level:S.level,pts:S.pts,total:total(),wk:S.week.k,wc:S.week.c,wt:S.week.t,lessons:Object.keys(S.done).length,upd:Date.now()});
function scheduleSync(now){
  if(session==='class'){clearTimeout(syncTimer);syncTimer=setTimeout(netSync,now?0:900);return}
  if(session!=='cloud'||!DB||cloudBlocked)return;
  clearTimeout(syncTimer);syncTimer=setTimeout(runSync,now?0:700);
}
async function runSync(){
  if(syncBusy){syncAgain=true;return}
  syncBusy=true;
  try{
    do{
      syncAgain=false;
      await DB.doc('data/users/'+UID+'/profile').set(snap(S));
      await DB.doc('board/'+UID).set(snap(boardDoc()));
    }while(syncAgain);
  }catch(e){
    const c=e&&e.code;
    if(c==='invalid_argument'||c==='revoked'||c==='not_granted'||c==='capability_disabled'){cloudBlocked=true;cloudNote='Saving to your account is not allowed on this link, so your progress stays on this device. Ask the grown-up who shared it for Contributor access.';if(screen==='home')render()}
    else if(c==='unavailable'||c==='resource_exhausted'){setTimeout(()=>scheduleSync(),4000)}
  }finally{syncBusy=false}
}
function subscribeBoard(){
  if(!DB)return;startLiveLoop();
  if(boardOn)return;boardOn=true;
  try{
    DB.collection('board').limit(500).onSnapshot(s=>{BOARD=s.docs.map(d=>Object.assign({id:d.id},d.data()));if(screen==='home'&&tab==='ranks')render()},()=>{boardOn=false});
  }catch(e){boardOn=false}
}
async function signIn(){
  if(cloud!=='ready')return;
  let cloudDoc=null;
  try{const s=await DB.doc('data/users/'+UID+'/profile').get();if(s.exists)cloudDoc=s.data()}catch(e){}
  session='cloud';
  if(cloudDoc){S=fix(cloudDoc);saveLocal();applyTheme();enter()}
  else if(S.nick){enter();scheduleSync(true)}
  else startSetup();
  subscribeBoard();
}
function guest(){
  session='guest';S=loadLocal();applyTheme();
  if(S.nick)enter();else startSetup();
}
function enter(){SS={pts:0,qa:0,qc:0,run:0};screen='home';tab='learn';render();window.scrollTo(0,0)}
function startSetup(){su={nick:'',avatar:'🦊',level:'b',pal:S.theme.pal||'Meadow',opts:nameOpts()};su.nick=su.opts[0].nick;su.avatar=su.opts[0].avatar;screen='setup';render()}
function persist(now){saveLocal();scheduleSync(now)}
