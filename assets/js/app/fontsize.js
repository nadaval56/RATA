/* ================= גודל טקסט =================
   שלוש מדרגות: s (הגודל המקורי), m, l. הבחירה נשמרת ב-localStorage
   בנפרד מההתקדמות (מפתח 'altimeter:fs'), כדי שייצוא/ייבוא/איפוס של
   ההתקדמות לא יגררו איתם העדפת תצוגה — ושההעדפה תישמר גם אחרי איפוס.
   ההחלה עצמה היא data-fs על <html>, וגיליון הסגנון מתרגם אותו לגודל בסיס.
   הקריאה והכתיבה עוברות דרך PRIVACY (privacy.js) כשהוא קיים, כדי שמי
   שביקש "בלי שמירה מקומית" לא יקבל כתיבה לדפדפן שלו. הפקדים מסונכרנים
   לפי [data-fs] ולא לפי .fs-bar, כך שגם סרגל הכותרת וגם תפריט הנגישות
   מציגים את אותו מצב. */
const FS_KEY = 'altimeter:fs';
const FS_STEPS = ['s','m','l'];

function readFontSize(){
  try {
    const v = (typeof PRIVACY !== 'undefined') ? PRIVACY.get(FS_KEY) : localStorage.getItem(FS_KEY);
    return FS_STEPS.indexOf(v) > -1 ? v : 's';
  } catch(e) { return 's'; }
}

function applyFontSize(v){
  document.documentElement.setAttribute('data-fs', v);
  document.querySelectorAll('[data-fs]').forEach(b=>{
    b.setAttribute('aria-pressed', String(b.dataset.fs === v));
  });
}

function setFontSize(v){
  if(FS_STEPS.indexOf(v) < 0) return;
  if(typeof PRIVACY !== 'undefined') PRIVACY.set(FS_KEY, v);
  else { try { localStorage.setItem(FS_KEY, v); } catch(e) { /* מצב פרטי — יחזיק להפעלה הזו בלבד */ } }
  applyFontSize(v);
}

applyFontSize(readFontSize());
