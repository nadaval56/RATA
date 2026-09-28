#!/usr/bin/env node
/*
  מייצר את דפי הנושא הסטטיים מתוך assets/js/data/*.js.

      node tools/pages/render.js

  למה סקריפט ולא כתיבה ביד: התוכן חי בקבצי הנתונים, והוא משתנה.
  כל דף שנכתב ביד יתיישן בשקט ברגע שמישהו יוסיף שאלה או כרטיסייה.
  הסקריפט גם מייצר מחדש את sitemap.xml, כדי שהוא לא ייפרד מהמציאות.

  הדפים מכילים את הסיכום, את מילון המונחים ומדגם קטן של שאלות (SAMPLE_N
  לכל נושא). שאר השאלות נשארות באפליקציה. המדגם קיים כי בלעדיו אין בדף
  אף שאלה אחת בטקסט סטטי, ומי שמחפש "שאלות לדוגמה" לא מגיע לאתר.
*/
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ORIGIN = 'https://dronexam.co.il';

/* ---------- טעינת הנתונים ---------- */
function loadData() {
  let src = '';
  for (const f of ['subjects', 'questions', 'cards', 'study'])
    src += fs.readFileSync(path.join(ROOT, 'assets/js/data', f + '.js'), 'utf8') + '\n';
  src += 'return {SUBJ, SRC, Q, CARDS, STUDY};';
  return new Function(src)();
}

/* ---------- הנושאים שמקבלים דף ----------
   התוכן בקבצי הנתונים; כאן רק מה שנוגע לדף עצמו.
   להוספת נושא: להוסיף רשומה ולוודא שיש לו מספיק תוכן לעמוד בפני עצמו. */
const PAGES = [
  {
    id: 'LAW',
    slug: 'aviation-law',
    h1: 'דיני תעופה: חומר הלימוד לבחינה העיונית למטיס כטב"ם קטן',
    title: 'דיני תעופה לכטב"ם קטן: הגדרות, רישוי ומגבלות | לעוף לשמיים',
    lede: 'ההגדרות, תנאי הרישוי, מגבלות ההפעלה והמרחקים מתוך תקנות הטיס ' +
          '(הפעלת מערכת כטב"ם קטן), התשפ"ד-2024, עם הפניה לתקנה הספציפית בכל סעיף.',
  },
  {
    id: 'CALC',
    slug: 'altitude-separation',
    h1: 'גובה והפרדה: חישוב תקרת הטיסה לכטב"ם קטן',
    title: 'חישוב גובה והפרדה לכטב"ם קטן לפי השיטה הרשמית | לעוף לשמיים',
    lede: 'ארבעת שלבי החישוב הרשמי, הערכים שמותר ושאסור להשתמש בהם, הדוגמה של רת"א, ' +
          'וארבע הטעויות הנפוצות בחישוב תקרת הטיסה.',
  },
  {
    id: 'OPS',
    slug: 'safety-emergency',
    h1: 'בטיחות וחירום: אחריות המטיס-המפקד, תדריך ותרחישי תקלה',
    title: 'בטיחות וחירום בהפעלת כטב"ם קטן: אחריות, תדריך ותקלות | לעוף לשמיים',
    lede: 'אחריות המטיס-המפקד לפי תקנה 22, מה חייב להיכלל בתדריך ומה המשמעות המשפטית שלו, ' +
          'הבדיקות שלפני כל הפעלה ושלושת תרחישי התקלה המרכזיים.',
  },
  {
    id: 'TECH',
    slug: 'technical-loading',
    h1: 'ידע טכני והעמסה: מערכות, ביצועים ובדיקת כשירות',
    title: 'ידע טכני והעמסה לכטב"ם קטן: מערכות, העמסה וכשירות | לעוף לשמיים',
    lede: 'מה נכלל בהעמסה ואיך היא משפיעה על הביצועים, ארבעת תחומי בדיקת הכשירות לפי תקנה 19(א), ' +
          'אופן הפעולה של רב-להב ושל כנף קבועה, והמכשירים והמונחים שצריך להכיר.',
  },
  {
    id: 'MET',
    slug: 'meteorology',
    h1: 'מטאורולוגיה: עננים, זרמים אנכיים ותנאי הפעלה',
    title: 'מטאורולוגיה למטיס כטב"ם קטן: עננים, רוח וזרמים | לעוף לשמיים',
    lede: 'חמשת סוגי העננים שצריך לזהות ומה כל אחד מהם מלמד, שני מנגנוני ההיווצרות, ' +
          'תרמיקות ועילוי מדרון, והשפעת הרוח והצפיפות על ההפעלה.',
  },
  {
    id: 'ENG',
    slug: 'aviation-english',
    h1: 'אנגלית טכנית: מונחים וקיצורים תעופתיים',
    title: 'אנגלית טכנית לבחינת כטב"ם: מונחים וקיצורים תעופתיים | לעוף לשמיים',
    lede: 'המונחים באנגלית שמופיעים בתקנות עצמן והקיצורים התעופתיים שנדרשים לבחינה, ' +
          'עם התרגום והמשמעות של כל אחד.',
  },
];

/* ---------- מדגם השאלות ---------- */
const SAMPLE_N = 5;

/* התשובה הנכונה בקובץ הנתונים תמיד ראשונה (האפליקציה מערבבת בזמן ריצה).
   בדף סטטי צריך סדר קבוע שאינו חושף אותה, ולכן ערבוב דטרמיניסטי לפי
   אינדקס השאלה: אותו סדר בכל הרצה, בלי שינויים מיותרים ב-git. */
function seededOrder(n, seed) {
  const idx = [...Array(n).keys()];
  let x = (seed * 2654435761) >>> 0;
  for (let i = n - 1; i > 0; i--) {
    x = (x * 1103515245 + 12345) >>> 0;
    const j = x % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/* שאלות פזורות לאורך הנושא (לא רק מתת-הנושא הראשון), בלי שאלות
   "הנכונה ביותר", שההסבר שלהן נשען על השוואה בין המסיחים. */
function pickSample(qs) {
  const pool = qs.filter(q => !/הנכונה ביותר/.test(q.q));
  const out = [];
  for (let k = 0; k < SAMPLE_N && k < pool.length; k++)
    out.push(pool[Math.floor(k * pool.length / SAMPLE_N)]);
  return out;
}

/* ---------- עזרי טקסט ---------- */
const stripTags = s => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const attr = s => stripTags(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonStr = s => JSON.stringify(stripTags(s));

/* התוכן בקבצי הנתונים מכיל HTML מכוון (b/u/br/span.kv) ומגיע מהריפו —
   הוא נכתב כ-HTML ולא עובר escaping. שדות טקסט-בלבד עוברים דרך attr(). */
const html = s => String(s);

/* חזית הכרטיסייה נכתבה לתצוגת כרטיס גדול וממורכז, ויש בה שני דברים
   שנראים דומים אבל אינם:
     - תווית אפורה ב-<span> עם font-size מוטבע ("שלושת הסעיפים",
       "corrective lenses") — קישוט לכרטיס, יורד כאן.
     - <br> חשוף — שבירת שורה בתוך המונח עצמו ("איפה מוצאים" /
       "את הפמ\"ת?"). מחיקת הזנב הזה הורסת את המונח, ולכן מאחדים. */
function splitTerm(front) {
  const parts = String(front)
    .replace(/<span[^>]*>[\s\S]*?<\/span>/gi, '')
    .split(/<br\s*\/?>/gi)
    .map(x => x.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  /* מונח שכבר מופרד בנקודות הוא רשימה ("location · attitude" /
     "altitude · direction of flight") ומתאחד באותו מפריד; מונח שהוא
     משפט ("איפה מוצאים" / "את הפמ\"ת?") מתאחד ברווח. */
  const sep = parts.some(x => x.includes(' · ')) ? ' · ' : ' ';
  return parts.join(sep);
}

/* כפתור התצוגה הכהה, זהה לזה שבאפליקציה (index.html). */
const THEME_BTN = `<button type="button" class="icon-btn" data-theme-toggle aria-pressed="false" title="מעבר לתצוגה כהה">
        <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>
        <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <span class="sr-only">תצוגה כהה</span>
      </button>`;

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ---------- בניית דף ---------- */
function buildPage(cfg, data, all) {
  const { SUBJ, STUDY, CARDS, Q } = data;
  const subj = SUBJ.find(s => s.id === cfg.id);
  const sections = STUDY[cfg.id] || [];
  const cards = CARDS.filter(c => c.s === cfg.id);
  const nQuestions = Q.filter(q => q.s === cfg.id).length;
  const nItems = sections.reduce((a, s) => a + (s.i || []).length, 0);
  const url = `${ORIGIN}/${cfg.slug}/`;
  const desc = attr(cfg.lede).slice(0, 300);

  const LETTERS = ['א', 'ב', 'ג', 'ד'];
  const sample = pickSample(Q.filter(q => q.s === cfg.id)).map((q, k) => {
    const order = seededOrder(q.o.length, Q.indexOf(q) + 1);
    const right = order.indexOf(0);
    return `
      <li class="sq">
        <p class="sq-q">${html(q.q)}</p>
        <ol class="sq-opts">
${order.map(i => `          <li>${html(q.o[i])}</li>`).join('\n')}
        </ol>
        <details class="sq-ans">
          <summary>הצגת התשובה</summary>
          <div class="gl-body"><b>התשובה הנכונה: ${LETTERS[right]}.</b> ${html(q.e)}${q.ref
            ? `<span class="gl-ref">${attr(q.ref)}</span>` : ''}</div>
        </details>
      </li>`;
  }).join('');

  const toc = sections.map((s, i) =>
    `      <li><a href="#s-${i + 1}">${attr(s.t)}</a></li>`).join('\n');

  const body = sections.map((s, i) => `
  <section class="doc-sec">
    <h2 id="s-${i + 1}">${html(s.t)}</h2>
    <ul>
${(s.i || []).map(x => `      <li>${html(x)}</li>`).join('\n')}
    </ul>
  </section>`).join('\n');

  /* כל מונח הוא <details>: נסגר כברירת מחדל כדי שהדף לא יימתח,
     אבל התוכן נשאר ב-HTML ולכן נסרק ונקרא כרגיל. */
  const glossary = cards.map(c => {
    return `
      <details class="gl">
        <summary>
          <span class="gl-term">${html(splitTerm(c.f))}</span>
        </summary>
        <div class="gl-body">${html(c.b)}${/[0-9\u0590-\u05FF]/.test(c.ref || '')
          ? `<span class="gl-ref">${attr(c.ref)}</span>` : ''}</div>
      </details>`;
  }).join('');

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': url + '#article',
        headline: stripTags(cfg.h1),
        description: stripTags(cfg.lede),
        inLanguage: 'he-IL',
        isAccessibleForFree: true,
        about: { '@type': 'Thing', name: stripTags(subj.name) },
        isPartOf: { '@id': ORIGIN + '/#website' },
        image: ORIGIN + '/assets/og/cover.jpg?v=3',
        dateModified: today(),
      },
      {
        '@type': 'DefinedTermSet',
        '@id': url + '#glossary',
        name: 'מילון מונחים: ' + stripTags(subj.name),
        inLanguage: 'he-IL',
        hasDefinedTerm: cards.map(c => ({
          '@type': 'DefinedTerm',
          name: stripTags(splitTerm(c.f)),
          description: stripTags(c.b).slice(0, 500),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'לעוף לשמיים', item: ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: stripTags(subj.name), item: url },
        ],
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- נוצר על ידי tools/pages/render.js מתוך assets/js/data/ — אין לערוך ידנית. -->

<title>${attr(cfg.title)}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">

<meta property="og:type" content="article">
<meta property="og:site_name" content="לעוף לשמיים">
<meta property="og:locale" content="he_IL">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${attr(cfg.title)}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${ORIGIN}/assets/og/cover.jpg?v=3">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ORIGIN}/assets/og/cover.jpg?v=3">

<meta name="theme-color" content="#F4F2EC" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1C1B19" media="(prefers-color-scheme: dark)">
<link rel="icon" href="../assets/icons/icon.svg" type="image/svg+xml">
<link rel="icon" href="../assets/icons/icon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="../assets/icons/icon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="../assets/icons/icon-192.png">

<link rel="preload" href="../assets/fonts/heebo-300-hebrew.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fonts/suezone-400-hebrew.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../assets/css/style.css">
<link rel="stylesheet" href="../assets/css/a11y.css">
<link rel="stylesheet" href="../assets/css/page.css">

<!-- החלה מוקדמת של העדפות התצוגה — לפני הציור הראשון, כדי למנוע הבהוב.
     אם המשתמש בחר "בלי שמירה מקומית" אין מה לקרוא, ולכן אין מה להחיל. -->
<script>
try{
  var _r=document.documentElement,_t=null;
  var _p=localStorage.getItem('privacy:v1');
  if(!_p||JSON.parse(_p).local!==false){
    var _fs=localStorage.getItem('altimeter:fs');
    if(_fs==='m'||_fs==='l')_r.setAttribute('data-fs',_fs);
    _t=localStorage.getItem('altimeter:theme');
    var _a=localStorage.getItem('a11y:v1');
    if(_a){_a=JSON.parse(_a);
      if(_a.mode)_r.classList.add('a11y-'+_a.mode);
      ['links','readable','spacing','still','cursor','focus'].forEach(function(k){if(_a[k])_r.classList.add('a11y-'+k);});}
  }
  if(_t!=='light'&&_t!=='dark')_t=(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
  _r.setAttribute('data-theme',_t);
}catch(e){}
</script>

<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body class="doc">

<a class="skip" href="#doc">דלג לתוכן</a>

<header class="band">
  <div class="wrap">
    <a class="brand" href="../">
      <img class="brand-mark" src="../assets/icons/icon.svg" alt="" width="34" height="34">
      <span class="band-txt"><span class="ttl">לעוף לשמיים</span><span class="cs">מבחן רת"א למטיס כטב"ם קטן</span></span>
    </a>
    <div class="band-tools">${THEME_BTN}</div>
  </div>
</header>

<main class="wrap doc-main" id="doc">

  <nav class="crumb" aria-label="נתיב">
    <a href="../">בית</a> <span aria-hidden="true">›</span> <span>${attr(subj.name)}</span>
  </nav>

  <h1>${attr(cfg.h1)}</h1>
  <p class="lede">${html(cfg.lede)}</p>

  <div class="factbar">
    <div><b>${nItems}</b><span>פריטי סיכום</span></div>
    <div><b>${cards.length}</b><span>הגדרות</span></div>
    <div><b>${nQuestions}</b><span>שאלות תרגול</span></div>
  </div>
  <p class="srcline">${attr(subj.note)}</p>

  <aside class="cta">
    <p>הדף הזה הוא חומר העיון. <b>${nQuestions} שאלות תרגול בנושא</b>, עם הסבר ומקור
    לכל אחת, נמצאות באפליקציה, ושם גם &quot;מד כשירות&quot; שעוקב אחרי ההתקדמות שלך.</p>
    <a class="btn mag" href="../">פתח את התרגול</a>
  </aside>

  <nav class="toc" aria-label="תוכן העניינים">
    <h2>בדף הזה</h2>
    <ol>
${toc}
      <li><a href="#sample">שאלות לדוגמה (${sample ? SAMPLE_N : 0})</a></li>
      <li><a href="#glossary">מילון מונחים (${cards.length})</a></li>
    </ol>
  </nav>
${body}

  <section class="doc-sec">
    <h2 id="sample">שאלות לדוגמה</h2>
    <p class="sec-note">${SAMPLE_N} שאלות מתוך ${nQuestions} שבאפליקציה. התשובה וההסבר נפתחים בלחיצה.</p>
    <ol class="sample">${sample}
    </ol>
  </section>

  <section class="doc-sec">
    <h2 id="glossary">מילון מונחים</h2>
    <div class="gl-tools">
      <span>${cards.length} מונחים</span>
      <button type="button" id="gl-all" hidden>פתח הכל</button>
    </div>
    <div class="glossary">${glossary}
    </div>
  </section>

  <aside class="cta">
    <p>אחרי הקריאה, בדוק את עצמך בשאלות התרגול.</p>
    <a class="btn mag" href="../">${nQuestions} שאלות תרגול בנושא ${attr(subj.name)}</a>
  </aside>

  <nav class="siblings" aria-label="נושאים נוספים">
    <h2>שאר נושאי הבחינה</h2>
    <ul>
${all.filter(o => o.id !== cfg.id).map(o => {
  const s2 = SUBJ.find(x => x.id === o.id);
  return `      <li><a href="../${o.slug}/">${attr(s2.name)}</a><span>${attr(s2.note)}</span></li>`;
}).join('\n')}
    </ul>
  </nav>

  <div class="notice">
    <b>אינו מסמך רשמי.</b> הדף מבוסס על תקנות הטיס (הפעלת מערכת כטב"ם קטן) התשפ"ד-2024,
    על פמ"ת פרק ב-09 ועל חוק הטיס התשע"א-2011, אך אינו מחליף אותם ואינו מהווה ייעוץ
    מקצועי או משפטי. ייתכנו טעויות, ולכן לפני כל הסתמכות יש לאמת מול המקור הרשמי
    ב<a href="https://www.gov.il/he/pages/knowledge-exam-uav" target="_blank" rel="noopener">אתר רת"א</a>.
  </div>

</main>

<footer class="site-foot">
  <div class="wrap">
    <p><a href="../"><b>לעוף לשמיים</b></a>: כלי לימוד חינמי בעברית לקראת הבחינה העיונית
    של רשות התעופה האזרחית (רת"א) לרישיון מטיס כטב"ם קטן.</p>
    <p>השאלות, ההסברים והמסיחים נוסחו על ידי Claude ואינם שאלות מבחן רשמיות.</p>
    <p class="foot-legal"><a href="../privacy/">מדיניות פרטיות</a> · <a href="../accessibility/">הצהרת נגישות</a> · <span class="tlh">ט.ל.ח</span></p>

    <nav class="sister" aria-label="האתרים הנוספים שלי">
      <span class="sister-lbl">עוד אתרים שלי</span>
      <a href="https://making-il.co.il/" rel="noopener"><span aria-hidden="true">🛠️</span> Making</a>
      <a href="https://banknote.co.il/" rel="noopener"><span aria-hidden="true">💶</span> Banknote · שטרות ומטבעות</a>
      <a href="https://www.geniza.co.il/" rel="noopener"><span aria-hidden="true">📜</span> הגניזה הקהירית</a>
      <a href="https://holisticcenter.co.il/" rel="noopener"><span aria-hidden="true">🌱</span> מעט צרי · רפואה משלימה</a>
      <a href="https://pursue.co.il/" rel="noopener"><span aria-hidden="true">🛸</span> PURSUE · ארכיון עב"מים</a>
      <a href="https://heb-cal.co.il/" rel="noopener"><span aria-hidden="true">📅</span> לוח עברי</a>
    </nav>  </div>
</footer>

<script src="../assets/js/app/privacy.js"></script>
<script src="../assets/js/app/fontsize.js"></script>
<script src="../assets/js/app/theme.js"></script>
<script src="../assets/js/app/a11y.js"></script>

<script>
/* שיפור מתקדם בלבד. בלי JS הדף עובד במלואו — <details> נפתח בלחיצה,
   והכפתור פשוט לא מופיע. לפני הדפסה פותחים הכל, אחרת המדפסת מקבלת
   מילון ריק. */
(function () {
  var box = document.querySelector('.glossary');
  if (!box) return;
  var items = box.querySelectorAll('details');
  var btn = document.getElementById('gl-all');
  if (!btn) return;
  btn.hidden = false;
  function setAll(open) {
    Array.prototype.forEach.call(items, function (d) { d.open = open; });
    btn.textContent = open ? 'סגור הכל' : 'פתח הכל';
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  setAll(false);
  btn.addEventListener('click', function () {
    setAll(btn.getAttribute('aria-expanded') !== 'true');
  });
  window.addEventListener('beforeprint', function () { setAll(true); });
})();
</script>

</body>
</html>
`;
}

/* ---------- sitemap ---------- */
function buildSitemap(slugs, lastmod) {
  /* דפי המדיניות אינם נוצרים כאן (הם נכתבים ביד), אבל הם חלק מהאתר
     ולכן חייבים להופיע במפה — אחרת הרינדור הבא היה מוחק אותם ממנה. */
  const STATIC = ['privacy', 'accessibility'];
  const urls = [{ loc: ORIGIN + '/', priority: '1.0' }]
    .concat(slugs.map(s => ({ loc: `${ORIGIN}/${s}/`, priority: '0.8' })))
    .concat(STATIC.map(s => ({ loc: `${ORIGIN}/${s}/`, priority: '0.3' })));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

/* ---------- main ---------- */
const data = loadData();
const stamp = today();

for (const cfg of PAGES) {
  const dir = path.join(ROOT, cfg.slug);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'index.html');
  fs.writeFileSync(out, buildPage(cfg, data, PAGES));
  const words = stripTags(fs.readFileSync(out, 'utf8')).split(/\s+/).length;
  console.log(`${cfg.slug}/index.html — ${(fs.statSync(out).size / 1024).toFixed(0)} KB, ~${words} words`);
}

const sm = path.join(ROOT, 'sitemap.xml');
fs.writeFileSync(sm, buildSitemap(PAGES.map(p => p.slug), stamp));
console.log(`sitemap.xml — ${PAGES.length + 3} URLs, lastmod ${stamp}`);
