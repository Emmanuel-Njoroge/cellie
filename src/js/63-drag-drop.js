/* ================= DRAG AND DROP (pointer events + tap fallback) ================= */
let drag=null;
const zoneAt=(x,y)=>{const e=document.elementFromPoint(x,y);return e&&e.closest?e.closest('[data-zone]'):null};
function clearOver(){document.querySelectorAll('.over').forEach(n=>n.classList.remove('over'))}
function dropTo(id,zone){
  const c=L&&L.cur;if(!c||c.done)return;const q=c.q;
  if(q.t==='sort'){if(zone==='tray')delete c.placed[id];else c.placed[id]=+zone}
  else if(q.t==='fill'){c.fillSel=zone==='tray'?null:id}
  c.held=null;sfx.tick();renderLesson();
}
function ddTap(id,from){
  const c=L&&L.cur;if(!c||c.done)return;
  if(from==='tray'){c.held=c.held===id?null:id;renderLesson()}
  else dropTo(id,'tray');
}
document.addEventListener('pointerdown',e=>{
  const el=e.target.closest&&e.target.closest('.dd');
  if(!el||!L||L.screen!=='q'&&L.screen!==undefined&&L.cur===null||!L.cur||L.cur.done||(e.button&&e.button>0))return;
  drag={el,id:+el.dataset.id,from:el.dataset.from,x0:e.clientX,y0:e.clientY,moved:false,ghost:null};
});
document.addEventListener('pointermove',e=>{
  if(!drag)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>7){
    drag.moved=true;const g=drag.el.cloneNode(true);g.className='chip ghostdrag';g.style.width=drag.el.offsetWidth+'px';document.body.appendChild(g);drag.ghost=g;drag.el.style.opacity='.35';
  }
  if(drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';clearOver();const z=zoneAt(e.clientX,e.clientY);z&&z.classList.add('over')}
});
function endDrag(e,cancel){
  if(!drag)return;const d=drag;drag=null;
  d.ghost&&d.ghost.remove();clearOver();
  if(cancel){d.el.style.opacity='';return}
  if(d.moved){const z=zoneAt(e.clientX,e.clientY);if(z)dropTo(d.id,z.dataset.zone);else if(d.from!=='tray')dropTo(d.id,'tray');else d.el.style.opacity=''}
  else ddTap(d.id,d.from);
}
document.addEventListener('pointerup',e=>endDrag(e,false));
document.addEventListener('pointercancel',e=>endDrag(e,true));
