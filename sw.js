/* Service worker: lets the app open offline.
   When you change any file, bump CACHE (e.g. 'my-wellness-v2')
   so phones pick up the new version. */
const CACHE = 'my-wellness-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/db.js',
  'js/data.js',
  'js/calc.js',
  'js/charts.js',
  'js/ui.js',
  'js/reminders.js',
  'js/views/shared.js',
  'js/views/onboarding.js',
  'js/views/dashboard.js',
  'js/views/nutrition.js',
  'js/views/workouts.js',
  'js/views/cycle.js',
  'js/views/progress.js',
  'js/views/settings.js',
  'js/app.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Show the saved copy right away, and refresh it in the background.
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      const network = fetch(event.request).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)); }
        return res;
      }).catch(() => cached || caches.match('index.html'));
      return cached || network;
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => (list.length ? list[0].focus() : self.clients.openWindow('./')))
  );
});
