/* ================= גודל טקסט =================
   שלוש מדרגות: s (הגודל המקורי), m, l. הבחירה נשמרת ב-localStorage
   בנפרד מההתקדמות (מפתח 'altimeter:fs'), כדי שייצוא/ייבוא/איפוס של
   ההתקדמות לא יגררו איתם העדפת תצוגה — ושהעדפה תישמר גם אחרי איפוס.
   ההחלה עצמה היא data-fs על <html>, וגיליון הסגנון מתרגם אותו לגודל בסיס. */
const FS_KEY = 'altimeter:fs';
const FS_STEPS = ['s','m','l'];

function readFontSize(){
  try{
    const v = localStorage.getItem(FS_KEY);
    return FS_STEPS.indexOf(v) > -1 ? v : 's';
  }catch(e){ return 's'; }
}

function applyFontSize(v){
  document.documentElement.setAttribute('data-fs', v);
  document.querySelectorAll('.fs-bar button').forEach(b=>{
    b.setAttribute('aria-pressed', String(b.dataset.fs === v));
  });
}

function setFontSize(v){
  if(FS_STEPS.indexOf(v) < 0) return;
  try{ localStorage.setItem(FS_KEY, v); }catch(e){ /* מצב פרטי — יחזיק להפעלה הזו בלבד */ }
  applyFontSize(v);
}

applyFontSize(readFontSize());
