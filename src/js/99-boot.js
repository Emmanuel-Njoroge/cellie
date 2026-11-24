/* ================= BOOT ================= */
applyTheme();render();netProbe();
let tries=0;
(function boot(){
  if(window.claude&&claude.use){initCloud();return}
  if(++tries>12){cloud='none';if(screen==='login')render();return}
  setTimeout(boot,300);
})();
