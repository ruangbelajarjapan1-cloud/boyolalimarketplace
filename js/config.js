// ============================================================
// GANTI URL DI BAWAH INI dengan URL Web App hasil Deploy
// Apps Script Anda (lihat langkah di apps-script/Code.gs / README).
//
// Contoh format URL yang benar:
// https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec
// ============================================================
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpK6IKQ8WwTQNrzfXqGvcEm5gV04bK2sjThDfpFPArgUDiQVVDw4GMqdbGRjZWpYWxag/exec';

const APP_NAME = 'Dulur';

// ============================================================
// PENGATURAN HARGA & PEMBAYARAN — edit sesuai keinginan Anda
// ============================================================
const HARGA_UNGGULAN = 10000; // dalam Rupiah
const DURASI_UNGGULAN_HARI = 7;

// Nomor WhatsApp Anda (pengelola), format internasional TANPA tanda + atau 0 di depan
// Contoh: 0812-3456-7890 ditulis jadi 6281234567890
const NOMOR_WA_ADMIN = '6281806089472';

// Info cara bayar yang akan ditampilkan ke penjual (QRIS, DANA, transfer bank, dll)
const INFO_PEMBAYARAN = 'Scan QRIS di bawah ini';

// Path gambar QRIS Anda — taruh file gambarnya di folder img/, lalu tulis nama filenya di sini
const QRIS_IMAGE_URL = 'qris.jpg';

// Dipakai file lain untuk cek apakah config.js sudah diisi dengan benar
function isConfigured() {
  return (
    typeof APPS_SCRIPT_URL === 'string' &&
    APPS_SCRIPT_URL.indexOf('GANTI_DENGAN') === -1 &&
    APPS_SCRIPT_URL.indexOf('https://') === 0
  );
}
