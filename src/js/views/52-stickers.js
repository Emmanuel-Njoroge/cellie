/* ----- Stickers ----- */
function stickersHTML(){
  const ea=earned();
  return `<h1 class="pt">Sticker book</h1><p class="sub">${ea.length} of ${BADGES.length} collected</p><div class="grid">${BADGES.map(b=>{const on=ea.includes(b.id);return `<div class="stk ${on?'on':''}"><div class="em">${on?b.icon:'❔'}</div><b>${esc(b.name)}</b><small>${on?'Collected!':esc(b.hint)}</small></div>`}).join('')}</div>`;
}
