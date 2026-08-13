// ============================================================
// SW.JS — Service Worker sederhana.
// Strategi: NETWORK-FIRST — selalu coba ambil versi terbaru dari
// internet dulu; cache cuma dipakai kalau sedang offline/sinyal
// lemah. Ini supaya update kode selalu langsung kepakai tanpa
// pengguna perlu hapus cache manual.
// ============================================================

const CACHE_NAME = 'dulur-shell-v10';

const FILE_KERANGKA = [
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/setup-check.js',
  './js/api.js',
  './js/session.js',
  './js/home.js',
  './icon-192.png',
  './icon-512.png',
  './img/placeholder.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILE_KERANGKA))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname.includes('script.google.com')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const salinan = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, salinan));
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
