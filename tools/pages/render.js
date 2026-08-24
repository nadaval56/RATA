#!/usr/bin/env node
/*
  מייצר את דפי הנושא הסטטיים מתוך assets/js/data/*.js.

      node tools/pages/render.js

  למה סקריפט ולא כתיבה ביד: התוכן חי בקבצי הנתונים, והוא משתנה.
  כל דף שנכתב ביד יתיישן בשקט ברגע שמישהו יוסיף שאלה או כרטיסייה.
  הסקריפט גם מייצר מחדש את sitemap.xml, כדי שהוא לא ייפרד מהמציאות.

  הדפים מכילים את הסיכום ואת מילון המונחים — לא את השאלות.
  השאלות הן מה שהאפליקציה עושה, והן הסיבה ללחוץ פנימה.
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
    h1: 'דיני תעופה — חומר הלימוד לבחינה העיונית למטיס כטב"ם קטן',
    title: 'דיני תעופה לכטב"ם קטן — הגדרות, רישוי ומגבלות | לעוף לשמיים',
    lede: 'ההגדרות, תנאי הרישוי, מגבלות ההפעלה והמרחקים — מרוכזים מתוך תקנות הטיס ' +
          '(הפעלת מערכת כטב"ם קטן), התשפ"ד-2024, עם הפניה לתקנה הספציפית בכל סעיף.',
  },
  {
    id: 'CALC',
    slug: 'altitude-separation',
    h1: 'גובה והפרדה — חישוב תקרת הטיסה לכטב"ם קטן',
    title: 'חישוב גובה והפרדה לכטב"ם קטן — השיטה הרשמית | לעוף לשמיים',
    lede: 'ארבעת שלבי החישוב הרשמי, הערכים שמותר ושאסור להשתמש בהם, הדוגמה של רת"א, ' +
          'וארבע המלכודות שמפילות בחישוב תקרת הטיסה.',
  },
  {
    id: 'OPS',
    slug: 'safety-emergency',
    h1: 'בטיחות וחירום — אחריות המטיס-המפקד, תדריך ותרחישי תקלה',
    title: 'בטיחות וחירום בהפעלת כטב"ם קטן — אחריות, תדריך ותקלות | לעוף לשמיים',
    lede: 'אחריות המטיס-המפקד לפי תקנה 22, מה חייב להיכלל בתדריך ולמה הוא משנה משפטית, ' +
          'הבדיקות שלפני כל הפעלה, ושלושת תרחישי התקלה המרכזיים.',
  },
  {
    id: 'TECH',
    slug: 'technical-loading',
    h1: 'ידע טכני והעמסה — מערכות, ביצועים ובדיקת כשירות',
    title: 'ידע טכני והעמסה לכטב"ם קטן — מערכות, העמסה וכשירות | לעוף לשמיים',
    lede: 'מה נכלל בהעמסה ומה היא עושה לביצועים, ארבעת תחומי בדיקת הכשירות לפי תקנה 19(א), ' +
          'אופן הפעולה של רב-להב ושל כנף קבועה, והמכשירים והמונחים.',
  },
  {
    id: 'MET',
    slug: 'meteorology',
    h1: 'מטאורולוגיה — עננים, זרמים אנכיים ותנאי הפעלה',
    title: 'מטאורולוגיה למטיס כטב"ם קטן — עננים, רוח וזרמים | לעוף לשמיים',
    lede: 'חמשת סוגי העננים שצריך לזהות ומה כל אחד מהם אומר, שני מנגנוני ההיווצרות, ' +
          'תרמיקות ועילוי מדרון, והשפעת הרוח והצפיפות על ההפעלה.',
  },
  {
    id: 'ENG',
    slug: 'aviation-english',
    h1: 'אנגלית טכנית — מונחים וקיצורים תעופתיים',
    title: 'אנגלית טכנית לבחינת כטב"ם — מונחים וקיצורים תעופתיים | לעוף לשמיים',
    lede: 'המונחים באנגלית שהתקנות עצמן משבצות, והקיצורים התעופתיים שנדרשים לבחינה — ' +
          'עם התרגום והמשמעות של כל אחד.',
  },
];

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
        image: ORIGIN + '/assets/og/cover.jpg',
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
<meta property="og:image" content="${ORIGIN}/assets/og/cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ORIGIN}/assets/og/cover.jpg">

<meta name="theme-color" content="#B4326D">
<link rel="icon" href="../assets/icons/icon.svg" type="image/svg+xml">
<link rel="icon" href="../assets/icons/icon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="../assets/icons/icon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="../assets/icons/icon-192.png">

<link rel="preload" href="../assets/fonts/heebo-300-hebrew.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fonts/suezone-400-hebrew.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../assets/css/style.css">
<link rel="stylesheet" href="../assets/css/page.css">

<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body class="doc">

<a class="skip" href="#doc">דלג לתוכן</a>

<header class="band">
  <div class="wrap">
    <a class="ttl" href="../">לעוף לשמיים</a>
    <span class="cs">CAAI · כטב"ם קטן &lt; 25kg · VLOS</span>
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
    לכל אחת, נמצאות באפליקציה — יחד עם &quot;מד כשירות&quot; שעוקב אחרי ההתקדמות שלך.</p>
    <a class="btn mag" href="../">פתח את התרגול</a>
  </aside>

  <nav class="toc" aria-label="תוכן העניינים">
    <h2>בדף הזה</h2>
    <ol>
${toc}
      <li><a href="#glossary">מילון מונחים (${cards.length})</a></li>
    </ol>
  </nav>
${body}

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
    <p>בוא נראה מה אתה זוכר.</p>
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
    מקצועי או משפטי. ייתכנו טעויות. לפני כל הסתמכות — אמת מול המקור הרשמי
    ב<a href="https://www.gov.il/he/pages/knowledge-exam-uav" target="_blank" rel="noopener">אתר רת"א</a>.
  </div>

</main>

<footer class="site-foot">
  <div class="wrap">
    <p><a href="../"><b>לעוף לשמיים</b></a> — כלי לימוד חופשי בעברית לקראת הבחינה העיונית
    של רשות התעופה האזרחית (רת"א) לרישיון מטיס כטב"ם קטן.</p>
    <p>השאלות, ההסברים והמסיחים נוסחו על ידי Claude ואינם שאלות מבחן רשמיות.</p>
    <p class="tlh">ט.ל.ח</p>
  </div>
</footer>

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
  const urls = [{ loc: ORIGIN + '/', priority: '1.0' }]
    .concat(slugs.map(s => ({ loc: `${ORIGIN}/${s}/`, priority: '0.8' })));
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
console.log(`sitemap.xml — ${PAGES.length + 1} URLs, lastmod ${stamp}`);
