/* ================= ערכת צבעים (בהיר / כהה) =================
   ברירת המחדל עוקבת אחרי הגדרת המערכת. לחיצה על הכפתור קובעת בחירה
   מפורשת, שנשמרת (דרך PRIVACY, כמו כל העדפה אחרת) תחת 'altimeter:theme'.
   ההחלה הראשונה נעשית בסקריפט המוקדם שב-<head>, לפני הציור, כדי שלא
   יהיה הבהוב לבן בפתיחה במצב כהה. כאן רק מחברים את הכפתור ומסנכרנים. */
const THEME_KEY = 'altimeter:theme';
const THEME_BG = { light: '#F4F2EC', dark: '#1C1B19' };
const themeMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function readTheme(){
  try {
    const v = (typeof PRIVACY !== 'undefined') ? PRIVACY.get(THEME_KEY) : localStorage.getItem(THEME_KEY);
    return (v === 'light' || v === 'dark') ? v : null;
  } catch(e) { return null; }
}

function resolvedTheme(){
  return readTheme() || (themeMQ && themeMQ.matches ? 'dark' : 'light');
}

function applyTheme(t){
  const root = document.documentElement;
  root.setAttribute('data-theme', t);
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', THEME_BG[t]));
  document.querySelectorAll('[data-theme-toggle]').forEach(b => {
    b.setAttribute('aria-pressed', String(t === 'dark'));
    b.setAttribute('title', t === 'dark' ? 'מעבר לתצוגה בהירה' : 'מעבר לתצוגה כהה');
  });
}

function toggleTheme(){
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  if(typeof PRIVACY !== 'undefined') PRIVACY.set(THEME_KEY, next);
  else { try { localStorage.setItem(THEME_KEY, next); } catch(e) {} }
  applyTheme(next);
}

document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));
/* כשאין בחירה מפורשת, שינוי בהגדרת המערכת (למשל מעבר אוטומטי למצב לילה)
   מתעדכן מיד, בלי רענון. */
if(themeMQ){
  const onChange = () => { if(!readTheme()) applyTheme(resolvedTheme()); };
  if(themeMQ.addEventListener) themeMQ.addEventListener('change', onChange);
  else if(themeMQ.addListener) themeMQ.addListener(onChange);
}
applyTheme(resolvedTheme());
