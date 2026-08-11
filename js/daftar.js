// ============================================================
// DAFTAR.JS — logika untuk daftar.html
// ============================================================

document.getElementById('daftarForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const noHp = document.getElementById('no_hp').value.trim();
  const formatValid = /^(\+?62|0)8[0-9]{8,12}$/.test(noHp.replace(/[\s-]/g, ''));
  if (!formatValid) {
    tampilkanToast('Format nomor HP tidak valid. Contoh: 0812xxxxxxx', 'error');
    return;
  }

  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Mendaftarkan...';

  const payload = {
    nama: document.getElementById('nama').value,
    no_hp: noHp,
    lokasi_kecamatan: document.getElementById('lokasi_kecamatan').value,
    kabupaten: document.getElementById('kabupaten').value,
  };

  const result = await apiPost('addUser', payload);

  if (result.error) {
    tampilkanToast(result.error, 'error');
    btn.disabled = false;
    btn.textContent = 'Daftar';
    return;
  }

  setCurrentUser({ user_id: result.user_id, ...payload });

  const params = new URLSearchParams(window.location.search);
  window.location.href = params.get('redirect') || 'index.html';
});
