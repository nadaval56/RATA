/* Service Worker — עבודה אופליין מלאה.
   אסטרטגיה: cache-first על כל הנכסים הסטטיים.
   כדי לפרוס גרסה חדשה: העלה את מספר CACHE (v1 → v2) — כל הנכסים ייטענו מחדש. */
const CACHE = 'altimeter-v7';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/style.css',
  './assets/js/data/subjects.js',
  './assets/js/data/questions.js',
  './assets/js/data/cards.js',
  './assets/js/data/study.js',
  './assets/js/app/storage.js',
  './assets/js/app/gauge.js',
  './assets/js/app/study.js',
  './assets/js/app/quiz.js',
  './assets/js/app/main.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/fonts/heebo-300-hebrew.woff2',
  './assets/fonts/heebo-300-latin.woff2',
  './assets/fonts/heebo-300-latin-ext.woff2',
  './assets/fonts/suezone-400-hebrew.woff2',
  './assets/fonts/suezone-400-latin.woff2',
  './assets/fonts/suezone-400-latin-ext.woff2',
  './assets/fonts/ibmplexmono-400-latin.woff2',
  './assets/fonts/ibmplexmono-400-latin-ext.woff2',
  './assets/fonts/ibmplexmono-600-latin.woff2',
  './assets/fonts/ibmplexmono-600-latin-ext.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll נכשל אם קובץ אחד חסר — cache פרטני סובלני יותר להבדלי נתיב.
      .then(c => Promise.all(ASSETS.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        // שמור עותק בקאש להפעלות הבאות (רק תגובות תקינות same-origin).
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
