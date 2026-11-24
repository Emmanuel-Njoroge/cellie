/* ================= MODAL ================= */
function modal(html){const m=$('#modal');m.innerHTML=`<div data-act="backdrop" style="position:absolute;inset:0"></div><div style="position:relative;width:100%;max-width:560px;display:flex;justify-content:center">${html}</div>`;m.hidden=false;const b=m.querySelector('.btn');b&&b.focus()}
function closeModal(){const m=$('#modal');m.hidden=true;m.innerHTML=''}
