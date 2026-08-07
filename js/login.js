// ============================================================
// LOGIN.JS — logika untuk login.html
// ============================================================

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Memeriksa...';

  const no_hp = document.getElementById('no_hp').value;
  const result = await apiGet('findUserByPhone', { no_hp });

  if (result.error) {
    alert(result.error);
    btn.disabled = false;
    btn.textContent = 'Masuk';
    return;
  }

  setCurrentUser(result);

  const params = new URLSearchParams(window.location.search);
  window.location.href = params.get('redirect') || 'index.html';
});
