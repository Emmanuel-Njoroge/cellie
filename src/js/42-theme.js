/* ================= THEME ================= */
const PALS=[['Meadow','#58cc02'],['Ocean','#1cb0f6'],['Sunset','#ff7a45'],['Berry','#d6409f'],['Teal','#14b8a6'],['Sunshine','#ffc800'],['Cosmic','#7c5cff'],['Cherry','#f43f5e']];
const hex2=h=>{h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.substr(i,2),16))};
const lum=h=>{const [r,g,b]=hex2(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
const shade=(h,f)=>'#'+hex2(h).map(v=>pad(Math.round(v*(1-f)).toString(16))).join('');
function accentHex(){const t=S.theme;if(t.custom&&/^#[0-9a-f]{6}$/i.test(t.custom))return t.custom;const p=PALS.find(p=>p[0]===t.pal);return (p||PALS[0])[1]}
const tint=(h,f)=>'#'+hex2(h).map(v=>pad(Math.round(v+(255-v)*f).toString(16))).join('');
const isDark=()=>S.theme.mode==='dark'||(S.theme.mode!=='light'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
function applyTheme(){
  const a=accentHex(),r=document.documentElement,ink=lum(a)>.5?'#1f2a30':'#ffffff';
  r.style.setProperty('--accent',a);r.style.setProperty('--accent-d',shade(a,.22));r.style.setProperty('--on-accent',ink);
  r.style.setProperty('--accent-tx',isDark()?tint(a,.35):(lum(a)>.35?shade(a,.45):shade(a,.15)));
  const m=S.theme.mode;if(m==='light'||m==='dark')r.setAttribute('data-theme',m);else r.removeAttribute('data-theme');
}
