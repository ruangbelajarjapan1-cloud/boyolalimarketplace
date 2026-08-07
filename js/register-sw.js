// ============================================================
// REGISTER-SW.JS — daftarkan Service Worker supaya app bisa
// di-install ("Add to Home Screen") dan tetap ringan dibuka.
// ============================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Kalau gagal daftar (mis. dibuka dari file lokal tanpa server),
      // app tetap jalan normal, cuma tanpa fitur install/offline.
    });
  });
}
