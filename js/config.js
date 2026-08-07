// ============================================================
// GANTI URL DI BAWAH INI dengan URL Web App hasil Deploy
// Apps Script Anda (lihat langkah di apps-script/Code.gs / README).
//
// Contoh format URL yang benar:
// https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec
// ============================================================
const APPS_SCRIPT_URL = 'GANTI_DENGAN_URL_APPS_SCRIPT_ANDA';

const APP_NAME = 'Marketplace Boyolali';

// Dipakai file lain untuk cek apakah config.js sudah diisi dengan benar
function isConfigured() {
  return (
    typeof APPS_SCRIPT_URL === 'string' &&
    APPS_SCRIPT_URL.indexOf('GANTI_DENGAN') === -1 &&
    APPS_SCRIPT_URL.indexOf('https://') === 0
  );
}
