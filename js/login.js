// ============================================================
// LOGIN.JS — logika untuk login.html
// ============================================================

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Memeriksa...';

  const no_hp = document.getElementById('no_hp').value;
  const pin = document.getElementById('pin').value;
  const result = await apiGet('loginUser', { no_hp, pin });

  if (result.error) {
    tampilkanToast(result.error, 'error');
    btn.disabled = false;
    btn.textContent = 'Masuk';
    return;
  }

  setCurrentUser(result);
  tampilkanToast(
    result.pin_baru_dibuat
      ? 'PIN berhasil dibuat untuk akun ini. Ingat baik-baik ya! 🔐'
      : `Selamat datang kembali, ${result.nama.split(' ')[0]}! 👋`,
    'success'
  );

  const params = new URLSearchParams(window.location.search);
  setTimeout(() => {
    window.location.href = params.get('redirect') || 'index.html';
  }, 900);
});
