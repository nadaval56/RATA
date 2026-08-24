/* ================= ניווט ================= */
let cur='home';
function go(v){
  cur=v;
  document.querySelectorAll('.view').forEach(e=>e.classList.remove('on'));
  document.getElementById('v-'+v).classList.add('on');
  document.querySelectorAll('nav.tabbar button').forEach(e=>e.classList.remove('on'));
  document.getElementById('n-'+v).classList.add('on');
  window.scrollTo(0,0);
  if(v==='study') renderStudy();
  if(v==='drill') renderDrillMenu();
  if(v==='weak') renderWeak();
  if(v==='home') render();
}

/* ================= אתחול ================= */
load();

/* רישום Service Worker לעבודה אופליין. נכשל בשקט על file:// — האפליקציה עובדת בלעדיו.
   עדכון אוטומטי: כשגרסה חדשה נפרסת ל-Pages, ה-SW החדש תופס פיקוד (skipWaiting+claim),
   אירוע controllerchange נורה, והדף מתרענן פעם אחת לבד — בלי התעסקות ידנית.
   hadController מונע רענון מיותר בהתקנה הראשונה, ו-refreshing מונע לולאת רענון. */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  let refreshing=false;
  const hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(refreshing || !hadController) return;
    refreshing=true;
    window.location.reload();
  });
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('sw.js').then(reg=>{
      // בדיקת עדכון יזומה בכל פתיחה, כדי לתפוס גרסה חדשה מוקדם ככל האפשר.
      reg.update().catch(()=>{});
    }).catch(()=>{});
  });
}
