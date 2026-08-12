// ============================================================
// API.JS — Semua fungsi di sini "bicara" ke Google Apps Script.
// Anda TIDAK perlu edit file ini kecuali menambah fitur baru.
//
// Ada retry otomatis: kalau server Google Apps Script sesaat sibuk
// (mis. banyak warga buka app bersamaan, kena batas 30 eksekusi
// bersamaan dari Google), app akan coba ulang otomatis 2x sebelum
// benar-benar nampilkan error ke user. Jadi lebih tahan trafik ramai.
// ============================================================

const MAKS_PERCOBAAN_ULANG = 2;
const JEDA_PERCOBAAN_ULANG_MS = 900;

function tunggu(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiGet(action, params = {}) {
  if (!isConfigured()) {
    return { error: 'setup_needed' };
  }

  for (let percobaan = 0; percobaan <= MAKS_PERCOBAAN_ULANG; percobaan++) {
    try {
      // "_t" (timestamp) ditambahkan supaya browser tidak pernah pakai jawaban
      // lama yang di-cache — data selalu diambil fresh dari spreadsheet.
      const query = new URLSearchParams({ action, ...params, _t: Date.now() }).toString();
      const res = await fetch(`${APPS_SCRIPT_URL}?${query}`, { cache: 'no-store' });

      if (res.ok) return await res.json();

      // Server sesaat sibuk (mis. terlalu banyak user bersamaan) — coba lagi
      if (percobaan < MAKS_PERCOBAAN_ULANG) {
        await tunggu(JEDA_PERCOBAAN_ULANG_MS * (percobaan + 1));
        continue;
      }
      return { error: 'Server sedang sibuk (banyak yang akses bersamaan). Coba refresh sebentar lagi.' };
    } catch (err) {
      if (percobaan < MAKS_PERCOBAAN_ULANG) {
        await tunggu(JEDA_PERCOBAAN_ULANG_MS * (percobaan + 1));
        continue;
      }
      return { error: 'Gagal terhubung ke backend. Cek koneksi internet & URL Apps Script.' };
    }
  }
}

async function apiPost(action, data = {}) {
  if (!isConfigured()) {
    return { error: 'setup_needed' };
  }

  for (let percobaan = 0; percobaan <= MAKS_PERCOBAAN_ULANG; percobaan++) {
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...data }),
      });

      if (res.ok) return await res.json();

      if (percobaan < MAKS_PERCOBAAN_ULANG) {
        await tunggu(JEDA_PERCOBAAN_ULANG_MS * (percobaan + 1));
        continue;
      }
      return { error: 'Server sedang sibuk (banyak yang akses bersamaan). Coba lagi sebentar.' };
    } catch (err) {
      if (percobaan < MAKS_PERCOBAAN_ULANG) {
        await tunggu(JEDA_PERCOBAAN_ULANG_MS * (percobaan + 1));
        continue;
      }
      return { error: 'Gagal terhubung ke backend. Cek koneksi internet & URL Apps Script.' };
    }
  }
}
