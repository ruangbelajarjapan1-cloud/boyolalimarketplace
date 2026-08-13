// ============================================================
// DAFTAR.JS — logika untuk daftar.html
// ============================================================

// Auto-isi kode referral kalau orang dibuka lewat link ajakan (?ref=KODE)
(function isiKodeReferralDariLink() {
  const params = new URLSearchParams(window.location.search);
  const kode = params.get('ref');
  if (kode) document.getElementById('kode_referral_dipakai').value = kode.toUpperCase();
})();

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

 const pin = document.getElementById('pin').value;
  if (!/^[0-9]{4}$/.test(pin)) {
    tampilkanToast('PIN wajib 4 digit angka.', 'error');
    return;
  }

  const payload = {
    nama: document.getElementById('nama').value,
    no_hp: noHp,
    lokasi_kecamatan: document.getElementById('lokasi_kecamatan').value,
    kabupaten: document.getElementById('kabupaten').value,
    kode_referral_dipakai: document.getElementById('kode_referral_dipakai').value.trim(),
    pin,
  };

  const result = await apiPost('addUser', payload);

  if (result.error) {
    tampilkanToast(result.error, 'error');
    btn.disabled = false;
    btn.textContent = 'Daftar';
    return;
  }

  setCurrentUser({ user_id: result.user_id, kode_referral: result.kode_referral, ...payload });
  tampilkanToast(`Selamat datang, ${payload.nama.split(' ')[0]}! Akun berhasil dibuat 🎉`, 'success');

  const params = new URLSearchParams(window.location.search);
  setTimeout(() => {
    window.location.href = params.get('redirect') || 'index.html';
  }, 900);
});
