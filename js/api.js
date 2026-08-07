// ============================================================
// API.JS — Semua fungsi di sini "bicara" ke Google Apps Script.
// Anda TIDAK perlu edit file ini kecuali menambah fitur baru.
// ============================================================

async function apiGet(action, params = {}) {
  if (!isConfigured()) {
    return { error: 'setup_needed' };
  }
  try {
    // "_t" (timestamp) ditambahkan supaya browser tidak pernah pakai jawaban
    // lama yang di-cache — data selalu diambil fresh dari spreadsheet.
    const query = new URLSearchParams({ action, ...params, _t: Date.now() }).toString();
    const res = await fetch(`${APPS_SCRIPT_URL}?${query}`, { cache: 'no-store' });
    if (!res.ok) return { error: 'Server backend error (status ' + res.status + ')' };
    return await res.json();
  } catch (err) {
    return { error: 'Gagal terhubung ke backend. Cek koneksi internet & URL Apps Script.' };
  }
}

async function apiPost(action, data = {}) {
  if (!isConfigured()) {
    return { error: 'setup_needed' };
  }
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...data }),
    });
    if (!res.ok) return { error: 'Server backend error (status ' + res.status + ')' };
    return await res.json();
  } catch (err) {
    return { error: 'Gagal terhubung ke backend. Cek koneksi internet & URL Apps Script.' };
  }
}
