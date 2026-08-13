// ============================================================
// SW.JS — Service Worker sederhana.
// Fungsinya 2: (1) syarat teknis supaya browser mau menawarkan
// "Install App", (2) simpan file statis (css/js/ikon) di cache
// supaya tampilan app tetap muncul walau sinyal sedang lemah.
//
// PENTING: data barang/chat TETAP selalu ambil langsung dari
// server (tidak di-cache) — cuma "kerangka" app ini yang di-cache.
// ============================================================

const CACHE_NAME = 'dulur-shell-v8';

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

  // Jangan cache panggilan ke Apps Script (data harus selalu fresh)
  if (url.hostname.includes('script.google.com')) return;

  // File statis: coba cache dulu, kalau tidak ada baru ambil dari network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // Offline & tidak ada di cache — tampilkan halaman utama sebagai fallback
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        })
      );
    })
  );
});
