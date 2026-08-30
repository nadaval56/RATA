/* ================= ניווט ================= */
let cur='home';
function go(v){
  cur=v;
  document.querySelectorAll('.view').forEach(e=>e.classList.remove('on'));
  document.getElementById('v-'+v).classList.add('on');
  /* aria-current משלים את הסימון הוויזואלי: הצבע והקו העליון מסמנים
     לעין איזו לשונית פעילה, וזה מסמן אותה לקורא מסך. */
  document.querySelectorAll('nav.tabbar button').forEach(e=>{
    e.classList.remove('on');
    e.removeAttribute('aria-current');
  });
  const tab=document.getElementById('n-'+v);
  tab.classList.add('on');
  tab.setAttribute('aria-current','page');
  window.scrollTo(0,0);
  if(v==='study') renderStudy();
  if(v==='drill') renderDrillMenu();
  if(v==='weak') renderWeak();
  if(v==='home') render();
  /* החלפת תצוגה באפליקציית עמוד-אחד אינה טעינת דף, ולכן קורא מסך
     לא מודיע עליה מעצמו. העברת המיקוד לכותרת התצוגה החדשה עושה זאת
     (WCAG 2.4.3). drawQ מעביר אחר כך את המיקוד לכותרת השאלה. */
  const head = document.getElementById('v-'+v).querySelector('h1,h2');
  if(head){
    if(!head.hasAttribute('tabindex')) head.setAttribute('tabindex','-1');
    head.focus({preventScroll:true});
  }
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
