// ============================================================
// DAFTAR.JS — logika untuk daftar.html
// ============================================================

document.getElementById('daftarForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Mendaftarkan...';

  const payload = {
    nama: document.getElementById('nama').value,
    no_hp: document.getElementById('no_hp').value,
    lokasi_kecamatan: document.getElementById('lokasi_kecamatan').value,
    kabupaten: document.getElementById('kabupaten').value,
  };

  const result = await apiPost('addUser', payload);

  if (result.error) {
    alert(result.error);
    btn.disabled = false;
    btn.textContent = 'Daftar';
    return;
  }

  setCurrentUser({ user_id: result.user_id, ...payload });

  // Kalau tadi diarahkan ke sini dari halaman lain (mis. Upload), kembali ke sana
  const params = new URLSearchParams(window.location.search);
  window.location.href = params.get('redirect') || 'index.html';
});
