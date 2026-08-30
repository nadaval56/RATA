/* ================= תפריט נגישות =================
   רכיב עצמאי שנבנה כאן, בקוד של האתר — ולא תוסף חיצוני.
   הסיבה כפולה: תוסף חיצוני היה טוען סקריפט מדומיין אחר וחושף
   את הגולשים לצד שלישי (בניגוד למדיניות הפרטיות של האתר), והוא
   גם היה מפסיק לעבוד במצב אופליין, שהוא חלק מהותי מהאפליקציה.

   חשוב לומר: התפריט הזה הוא *תוספת* לנגישות ולא תחליף לה.
   הנגישות עצמה — סמנטיקה, ניגודיות, ניווט מקלדת, תיאורים לקוראי
   מסך — בנויה לתוך הדפים; ת"י 5568 דורש את זה ולא תפריט.

   כל ההגדרות נשמרות ב-localStorage תחת 'a11y:v1', דרך PRIVACY,
   כך שמי שביקש לא לשמור דבר — לא נשמר לו דבר.
   קיצור מקלדת: Alt+Shift+A. סגירה: Esc. */

const A11Y_KEY = 'a11y:v1';
const A11Y_FLAGS = ['links', 'readable', 'spacing', 'still', 'cursor', 'focus'];
const A11Y_MODES = ['contrast', 'invert', 'mono'];

var A11Y = (function () {

  let state = { mode: '', links: 0, readable: 0, spacing: 0, still: 0, cursor: 0, focus: 0 };
  let panel = null, fab = null, lastFocus = null;

  function load() {
    try {
      const raw = (typeof PRIVACY !== 'undefined') ? PRIVACY.get(A11Y_KEY) : localStorage.getItem(A11Y_KEY);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch (e) { /* נשארים בברירת המחדל */ }
    if (A11Y_MODES.indexOf(state.mode) < 0) state.mode = '';
  }

  function save() {
    const raw = JSON.stringify(state);
    if (typeof PRIVACY !== 'undefined') PRIVACY.set(A11Y_KEY, raw);
    else { try { localStorage.setItem(A11Y_KEY, raw); } catch (e) {} }
  }

  function apply() {
    const r = document.documentElement;
    A11Y_MODES.forEach(function (m) { r.classList.toggle('a11y-' + m, state.mode === m); });
    A11Y_FLAGS.forEach(function (f) { r.classList.toggle('a11y-' + f, !!state[f]); });
    sync();
  }

  /* מסנכרן את מצב הכפתורים בתפריט אל המצב בפועל. */
  function sync() {
    if (!panel) return;
    panel.querySelectorAll('[data-mode]').forEach(function (b) {
      b.setAttribute('aria-pressed', String((b.dataset.mode || '') === state.mode));
    });
    panel.querySelectorAll('[data-flag]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(!!state[b.dataset.flag]));
    });
  }

  function setMode(m) {
    state.mode = (state.mode === m) ? '' : m;   /* לחיצה חוזרת מכבה */
    save(); apply(); announce();
  }
  function toggleFlag(f) {
    state[f] = state[f] ? 0 : 1;
    save(); apply(); announce();
  }
  function reset() {
    state = { mode: '', links: 0, readable: 0, spacing: 0, still: 0, cursor: 0, focus: 0 };
    save(); apply();
    if (typeof setFontSize === 'function') setFontSize('s');
    announce('הגדרות הנגישות אופסו');
  }

  /* הודעה לקוראי מסך על שינוי שאין לו ביטוי במיקוד. */
  function announce(msg) {
    const live = document.getElementById('a11y-live');
    if (!live) return;
    live.textContent = msg || 'הגדרות הנגישות עודכנו';
    setTimeout(function () { live.textContent = ''; }, 1200);
  }

  /* ---------- בניית התפריט ---------- */

  function base() {
    const segs = location.pathname.split('/').filter(Boolean);
    const last = segs[segs.length - 1] || '';
    const depth = segs.length - (last.indexOf('.') > -1 ? 1 : 0);
    return depth > 0 ? '../'.repeat(depth) : '';
  }

  function tog(flag, label) {
    return '<button type="button" class="a11y-tog" data-flag="' + flag + '" aria-pressed="false">' +
           '<span>' + label + '</span><span class="sw" aria-hidden="true"></span></button>';
  }

  function build() {
    const b = base();

    fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'a11y-fab';
    fab.id = 'a11y-fab';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'a11y-panel');
    fab.setAttribute('aria-label', 'תפריט נגישות (Alt+Shift+A)');
    fab.title = 'תפריט נגישות — Alt+Shift+A';
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="4" r="2"/>' +
      '<path d="M20 7.5c0 .8-.6 1.4-1.4 1.4L15 8.4v3.2l2.6 8.3a1.4 1.4 0 0 1-2.6 1L12.6 14h-1.2L9 20.9a1.4 1.4 0 0 1-2.6-1L9 11.6V8.4l-3.6.5A1.4 1.4 0 0 1 4 7.5c0-.8.6-1.4 1.4-1.4l6.6.9 6.6-.9c.8 0 1.4.6 1.4 1.4z"/>' +
      '</svg>';

    panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.id = 'a11y-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'a11y-title');
    panel.innerHTML =
      '<div class="a11y-hd">' +
        '<h2 id="a11y-title">נגישות</h2>' +
        '<button type="button" class="a11y-x" aria-label="סגירת תפריט הנגישות">✕</button>' +
      '</div>' +

      '<div class="a11y-grp">' +
        '<h3>גודל טקסט</h3>' +
        '<div class="a11y-seg three" role="group" aria-label="גודל טקסט">' +
          '<button type="button" class="sz-s" data-fs="s" aria-pressed="false">קטן</button>' +
          '<button type="button" class="sz-m" data-fs="m" aria-pressed="false">בינוני</button>' +
          '<button type="button" class="sz-l" data-fs="l" aria-pressed="false">גדול</button>' +
        '</div>' +
      '</div>' +

      '<div class="a11y-grp">' +
        '<h3>מצב תצוגה</h3>' +
        '<div class="a11y-seg" role="group" aria-label="מצב תצוגה">' +
          '<button type="button" data-mode="contrast" aria-pressed="false">ניגודיות גבוהה</button>' +
          '<button type="button" data-mode="invert" aria-pressed="false">ניגודיות הפוכה</button>' +
          '<button type="button" data-mode="mono" aria-pressed="false">גווני אפור</button>' +
          '<button type="button" data-mode="" aria-pressed="false">צבעי האתר</button>' +
        '</div>' +
      '</div>' +

      '<div class="a11y-grp">' +
        '<h3>קריאוּת</h3>' +
        tog('readable', 'פונט קריא') +
        tog('spacing', 'ריווח שורות ואותיות') +
        tog('links', 'הדגשת קישורים') +
      '</div>' +

      '<div class="a11y-grp">' +
        '<h3>ניווט</h3>' +
        tog('focus', 'הדגשת מיקוד מקלדת') +
        tog('cursor', 'סמן עכבר גדול') +
        tog('still', 'עצירת אנימציות') +
      '</div>' +

      '<div class="a11y-foot">' +
        '<button type="button" class="a11y-reset">איפוס הגדרות הנגישות</button>' +
        '<p class="a11y-links-row">' +
          '<a href="' + b + 'accessibility/">הצהרת נגישות</a> · ' +
          '<a href="' + b + 'privacy/">מדיניות פרטיות</a>' +
        '</p>' +
        '<p class="a11y-kbd">Alt+Shift+A · Esc לסגירה</p>' +
      '</div>';

    const live = document.createElement('div');
    live.id = 'a11y-live';
    live.className = 'sr-only';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');

    /* הכפתור והתפריט ממוקמים fixed, ולכן מיקומם ב-DOM אינו נראה —
       אבל הוא קובע מתי מגיעים אליהם ב-Tab. בסוף ה-body תפריט הנגישות
       היה התחנה האחרונה בדף, אחרי כל התוכן; כאן הוא בא מיד אחרי קישור
       הדילוג, לפני הודעת הפרטיות ולפני שאר הדף. */
    const skip = document.querySelector('a.skip');
    if (skip && skip.parentNode === document.body) skip.after(fab, panel, live);
    else document.body.prepend(fab, panel, live);

    fab.addEventListener('click', function () { toggle(); });
    panel.querySelector('.a11y-x').addEventListener('click', close);
    panel.querySelector('.a11y-reset').addEventListener('click', reset);

    panel.querySelectorAll('[data-fs]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof setFontSize === 'function') setFontSize(btn.dataset.fs);
        announce('גודל הטקסט עודכן');
      });
    });
    panel.querySelectorAll('[data-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () { setMode(btn.dataset.mode || ''); });
    });
    panel.querySelectorAll('[data-flag]').forEach(function (btn) {
      btn.addEventListener('click', function () { toggleFlag(btn.dataset.flag); });
    });

    /* לכידת מיקוד: כל עוד התפריט פתוח, Tab מסתובב בתוכו בלבד. */
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const items = panel.querySelectorAll('button, a[href]');
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { close(); return; }
      /* Alt+Shift+A — code ולא key, כדי שיעבוד גם בפריסת מקלדת עברית. */
      if (e.altKey && e.shiftKey && e.code === 'KeyA') { e.preventDefault(); toggle(); }
    });

    document.addEventListener('click', function (e) {
      if (panel.hidden) return;
      if (panel.contains(e.target) || fab.contains(e.target)) return;
      close();
    });

    sync();
  }

  function open() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    lastFocus = document.activeElement;
    const first = panel.querySelector('button, a[href]');
    if (first) first.focus();
  }
  function close() {
    if (panel.hidden) return;
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    /* חוזרים למקום שממנו נפתח התפריט — אבל רק אם זה באמת פקד שהמשתמש
       עמד עליו. פתיחה בקיצור מקלדת עלולה לתפוס אלמנט שמוקד תכנותית
       (<main> אחרי סגירת הודעת הפרטיות, למשל) או את body, שאינו ניתן
       למיקוד כלל; בשני המקרים החזרה לשם מאבדת את המשתמש. הנפילה
       האחורית היא הכפתור, שהוא עוגן קבוע וצפוי. */
    const CONTROL = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
    if (lastFocus && document.contains(lastFocus) && lastFocus.matches && lastFocus.matches(CONTROL))
      lastFocus.focus();
    else
      fab.focus();
  }
  function toggle() { panel.hidden ? open() : close(); }

  /* מודד את גובה סרגל הניווט התחתון ומפרסם אותו כמשתנה CSS, כדי
     שהודעת הפרטיות וכפתור הנגישות יישבו בדיוק מעליו. ResizeObserver
     תופס גם שינוי גודל טקסט וגם סיבוב מסך, בלי להאזין לכל אחד בנפרד. */
  function measureDock() {
    const bar = document.querySelector('nav.tabbar');
    if (!bar) return;
    const set = function () {
      document.documentElement.style.setProperty('--tabbar-h', bar.offsetHeight + 'px');
    };
    set();
    if (typeof ResizeObserver === 'function') new ResizeObserver(set).observe(bar);
    else window.addEventListener('resize', set);
  }

  function init() {
    load();
    build();
    measureDock();
    apply();
    /* fontsize.js רץ לפני שהתפריט נבנה, ולכן כפתורי הגודל שבו
       עדיין לא סונכרנו — כאן מחילים שוב על הפקדים שנוצרו. */
    if (typeof applyFontSize === 'function' && typeof readFontSize === 'function')
      applyFontSize(readFontSize());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* אם המשתמש ביטל את השמירה המקומית — ההגדרות מתאפסות מיד. */
  document.addEventListener('privacy:change', function (e) {
    if (e.detail && e.detail.local === false) reset();
  });

  return { open: open, close: close, toggle: toggle, reset: reset };
})();
