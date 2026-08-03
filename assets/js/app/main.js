/* ================= ניווט ================= */
let cur='home';
function go(v){
  cur=v;
  document.querySelectorAll('.view').forEach(e=>e.classList.remove('on'));
  document.getElementById('v-'+v).classList.add('on');
  document.querySelectorAll('nav button').forEach(e=>e.classList.remove('on'));
  document.getElementById('n-'+v).classList.add('on');
  window.scrollTo(0,0);
  if(v==='study') renderStudy();
  if(v==='drill') renderDrillMenu();
  if(v==='weak') renderWeak();
  if(v==='home') render();
}

/* ================= אתחול ================= */
load();

/* רישום Service Worker לעבודה אופליין. נכשל בשקט על file:// — האפליקציה עובדת בלעדיו. */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
