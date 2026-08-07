// ============================================================
// PROFIL.JS — logika untuk profil.html
// Selalu ambil data TERBARU dari server (bukan cuma cache lokal),
// supaya status verifikasi dkk selalu akurat.
// ============================================================

async function muatProfil() {
  const localUser = getCurrentUser();

  if (!localUser) {
    tampilkanBelumLogin();
    return;
  }

  // Ambil data terbaru dari server pakai user_id yang tersimpan
  const fresh = await apiGet('getUserById', { user_id: localUser.user_id });

  if (fresh.error) {
    // Server tidak menemukan user ini lagi (mis. dihapus manual) — anggap belum login
    tampilkanBelumLogin();
    return;
  }

  // Perbarui cache lokal supaya konsisten dengan server
  setCurrentUser(fresh);
  tampilkanProfil(fresh);
}

function tampilkanBelumLogin() {
  document.getElementById('avatarBesar').textContent = '?';
  document.getElementById('namaUser').textContent = 'Anda belum masuk';
  document.getElementById('badgeVerifikasi').style.display = 'none';
  document.getElementById('infoList').innerHTML = '';
  document.getElementById('ctaVerifikasi').innerHTML = '';
  document.getElementById('areaTombol').innerHTML = `
    <a class="btn btn-primary" href="login.html" style="margin-bottom:10px;">Masuk</a>
    <a class="btn btn-secondary" href="daftar.html">Daftar Akun Baru</a>
  `;
}

function tampilkanProfil(user) {
  document.getElementById('avatarBesar').textContent = user.nama.charAt(0).toUpperCase();
  document.getElementById('namaUser').textContent = user.nama;

  const terverifikasi = user.is_verified_ktp === true;
  const badge = document.getElementById('badgeVerifikasi');
  badge.style.display = 'inline-block';
  badge.className = 'badge ' + (terverifikasi ? 'badge-verified' : '');
  badge.style.background = terverifikasi ? '' : '#eee';
  badge.style.color = terverifikasi ? '' : 'var(--color-muted)';
  badge.textContent = terverifikasi ? '✅ Terverifikasi' : '⏳ Belum Terverifikasi';

  document.getElementById('infoList').innerHTML = `
    <div class="row">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
      <span>${user.no_hp || '-'}</span>
    </div>
    <div class="row">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>${user.lokasi_kecamatan || '-'}, ${user.kabupaten || '-'}</span>
    </div>
  `;

  document.getElementById('ctaVerifikasi').innerHTML = terverifikasi
    ? ''
    : `
      <div class="info-note">
        🔒 Mau dapat badge <strong>Terverifikasi</strong>? Kirim foto KTP Anda ke
        pengelola aplikasi lewat WhatsApp untuk diperiksa manual — bikin sesama
        warga lebih percaya sama listing Anda.
      </div>
    `;

  document.getElementById('areaTombol').innerHTML = `
    <button class="btn btn-secondary" onclick="logout(); location.reload();">Keluar</button>
  `;
}

muatProfil();
