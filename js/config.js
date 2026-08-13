// ============================================================
// KONEKSI BACKEND — Supabase (pengganti Google Apps Script)
// ============================================================
const SUPABASE_URL = 'https://oohuxqgizqdvvlhkcmsx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jYqLiDztkLuhgOQ37WUbzw_phAHQEgx';

const APP_NAME = 'Dulur';

// ============================================================
// PENGATURAN HARGA & PEMBAYARAN — edit sesuai keinginan Anda
// ============================================================
const HARGA_UNGGULAN = 10000; // dalam Rupiah
const DURASI_UNGGULAN_HARI = 7;

const HARGA_SUNDUL = 3000; // sekali bayar, bump ke atas urutan Terbaru
const HARGA_TOKO_BULANAN = 15000; // langganan bulanan, badge "🏪 Toko"
const DURASI_TOKO_HARI = 30;

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
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL.indexOf('GANTI_DENGAN') === -1 &&
    SUPABASE_URL.indexOf('https://') === 0 &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY.length > 10
  );
}
