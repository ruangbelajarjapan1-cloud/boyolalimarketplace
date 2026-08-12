// ============================================================
// API.JS — Semua fungsi di sini "bicara" ke Google Apps Script.
// Anda TIDAK perlu edit file ini kecuali menambah fitur baru.
//
// 2 pengaman:
// 1. TIMEOUT — tiap permintaan dibatasi maksimal 15 detik. Kalau
//    koneksi macet total (bukan cuma lambat), permintaan otomatis
//    dibatalkan, tidak akan menunggu selamanya.
// 2. RETRY — kalau gagal/timeout, coba ulang otomatis 2x dengan
//    jeda meningkat, sebelum benar-benar nampilkan error ke user.
// ============================================================

const MAKS_PERCOBAAN_ULANG = 2;
const JEDA_PERCOBAAN_ULANG_MS = 900;
const BATAS_WAKTU_MS = 15000;

function tunggu(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Bungkus fetch biasa dengan batas waktu — kalau lebih dari 15 detik
// tidak ada balasan sama sekali, permintaan dibatalkan paksa.
function fetchDenganTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BATAS_WAKTU_MS);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
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
      const res = await fetchDenganTimeout(`${APPS_SCRIPT_URL}?${query}`, { cache: 'no-store' });

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
      const pesan = err.name === 'AbortError'
        ? 'Koneksi ke server macet (lebih dari 15 detik tidak ada balasan). Cek internet Anda, lalu refresh.'
        : 'Gagal terhubung ke backend. Cek koneksi internet & URL Apps Script.';
      return { error: pesan };
    }
  }
}

async function apiPost(action, data = {}) {
  if (!isConfigured()) {
    return { error: 'setup_needed' };
  }

  for (let percobaan = 0; percobaan <= MAKS_PERCOBAAN_ULANG; percobaan++) {
    try {
      const res = await fetchDenganTimeout(APPS_SCRIPT_URL, {
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
      const pesan = err.name === 'AbortError'
        ? 'Koneksi ke server macet (lebih dari 15 detik tidak ada balasan). Cek internet Anda, lalu coba lagi.'
        : 'Gagal terhubung ke backend. Cek koneksi internet & URL Apps Script.';
      return { error: pesan };
    }
  }
}
