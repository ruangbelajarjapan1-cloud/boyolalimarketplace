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

  document.getElementById('infoList').innerHTML = `
    <div class="skeleton-row" style="box-shadow:none; margin:0;"><div style="flex:1;"><div class="skeleton-block text"></div></div></div>
  `;

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
    <div class="row" style="cursor:pointer;" onclick="tampilkanShareReferral('${user.kode_referral || ''}', '${user.user_id}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
      <span>Kode Referral: <strong>${user.kode_referral || '-'}</strong> — <span id="jumlahReferral" style="color:var(--color-primary-dark);">memuat...</span></span>
    </div>
  `;

  muatJumlahReferral(user.user_id);

  document.getElementById('ctaVerifikasi').innerHTML = terverifikasi
    ? ''
    : `
      <div class="info-note">
        🔒 Mau dapat badge <strong>Terverifikasi</strong>? Kirim foto KTP Anda ke
        pengelola aplikasi lewat WhatsApp untuk diperiksa manual — bikin sesama
        warga lebih percaya sama listing Anda.
      </div>
    `;

  const tokoAktif = user.is_toko === true && user.toko_sampai && new Date(user.toko_sampai) >= new Date();
  document.getElementById('ctaToko').innerHTML = tokoAktif
    ? `<div class="info-note" style="background:#e0f0ff; border-color:#b3d9ff; color:#1a5fa0;">🏪 Anda Akun Toko aktif sampai ${new Date(user.toko_sampai).toLocaleDateString('id-ID')}.</div>`
    : `<button class="btn" style="width:100%; background:#e0f0ff; color:#1a5fa0; margin-bottom:12px;" onclick="tampilkanFormToko()">🏪 Jadi Akun Toko (Rp${HARGA_TOKO_BULANAN.toLocaleString('id-ID')}/bulan)</button>`;

  muatRatingSaya(user.user_id);

  const notifSudahAktif = typeof notifikasiAktif === 'function' && notifikasiAktif();

  document.getElementById('areaTombol').innerHTML = `
    <button class="btn" id="btnToggleNotif" style="width:100%; margin-bottom:10px; ${notifSudahAktif ? 'background:#eee; color:var(--color-ink);' : 'background:var(--color-primary); color:white;'}">
      ${notifSudahAktif ? '🔕 Matikan Notifikasi Chat' : '🔔 Aktifkan Notifikasi Chat'}
    </button>
    <button class="btn" style="width:100%; background:#25D366; color:white; margin-bottom:10px;" onclick="tampilkanAjakShare()">📤 Ajak Teman/Keluarga Pakai Dulur</button>
    <button class="donasi-btn" style="margin-bottom:10px;" onclick="tampilkanFormDonasi()">☕ Traktir Kopi untuk Developer</button>
    <a class="btn btn-secondary" href="peraturan.html" style="margin-bottom:10px;">📄 Syarat & Ketentuan</a>
    <button class="btn btn-secondary" onclick="logout(); location.reload();">Keluar</button>
  `;

  document.getElementById('btnToggleNotif').addEventListener('click', async () => {
    if (notifSudahAktif) {
      matikanNotifikasiChat();
    } else {
      await mintaIzinNotifikasi();
    }
    tampilkanProfil(user);
  });
}

async function muatJumlahReferral(userId) {
  const hasil = await apiGet('getReferralCount', { user_id: userId });
  const el = document.getElementById('jumlahReferral');
  if (el && hasil && typeof hasil.jumlah === 'number') {
    el.textContent = `${hasil.jumlah} teman diajak`;
  }
}

function tampilkanShareReferral(kode, userId) {
  if (!kode || kode === '-') {
    tampilkanToast('Kode referral sedang disiapkan, coba refresh halaman sebentar lagi.', 'error');
    return;
  }
  const linkReferral = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'daftar.html?ref=' + kode;
  const teks = encodeURIComponent(
    `Yuk daftar di *Dulur* pakai kode referral aku: *${kode}*\nDaftar di sini: ${linkReferral}`
  );

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box" style="text-align:center;">
      <p style="font-size:2rem; margin:0 0 6px;">🙋</p>
      <h3 style="margin:0 0 6px;">Ajak Teman, Kode Anda: ${kode}</h3>
      <p style="font-size:0.85rem; color:var(--color-muted);">
        Kalau teman daftar pakai kode ini, mereka otomatis tercatat sebagai ajakan Anda.
      </p>
      <a href="https://wa.me/?text=${teks}" target="_blank" class="btn btn-primary" style="margin-bottom:8px;">📤 Bagikan Kode via WhatsApp</a>
      <button class="btn btn-secondary" id="btnTutupReferral">Tutup</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('btnTutupReferral').addEventListener('click', () => modal.remove());
}

function tampilkanFormToko() {
  const user = getCurrentUser();
  const hargaFormat = HARGA_TOKO_BULANAN.toLocaleString('id-ID');
  const pesanWa = encodeURIComponent(
    `Halo, saya (${user.nama}, ID: ${user.user_id}) mau jadi Akun Toko selama ${DURASI_TOKO_HARI} hari. Saya sudah transfer Rp${hargaFormat}. Ini bukti transfernya:`
  );
  const linkWa = `https://wa.me/${NOMOR_WA_ADMIN}?text=${pesanWa}`;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <h3 style="margin-top:0;">🏪 Jadi Akun Toko</h3>
      <p style="font-size:0.9rem; color:var(--color-muted);">
        Badge "🏪 Toko" muncul di semua listing Anda, tanda Anda penjual
        aktif & rutin — bukan cuma jual barang bekas sesekali.
      </p>
      <p style="font-size:1.3rem; font-weight:800; color:#1a5fa0; font-family:'Plus Jakarta Sans',sans-serif;">
        Rp${hargaFormat} / ${DURASI_TOKO_HARI} hari
      </p>
      <div class="info-note">
        <strong>${INFO_PEMBAYARAN}:</strong>
        <img src="${QRIS_IMAGE_URL}" alt="QRIS Pembayaran" style="width:100%; border-radius:12px; margin-top:8px; display:block;" onerror="this.style.display='none'"/>
      </div>
      <p style="font-size:0.85rem;">Setelah transfer, kirim bukti bayar via WhatsApp — status Toko Anda diaktifkan manual dalam waktu singkat.</p>
      <a href="${linkWa}" target="_blank" class="btn btn-primary" style="margin-bottom:8px; background:#1a5fa0; box-shadow:none;">Kirim Bukti Bayar via WhatsApp</a>
      <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Batal</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function tampilkanFormDonasi() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box" style="text-align:center;">
      <p style="font-size:2rem; margin:0 0 6px;">☕</p>
      <h3 style="margin-top:0;">Traktir Kopi untuk Developer</h3>
      <p style="font-size:0.85rem; color:var(--color-muted);">
        Suka pakai Dulur? Boleh banget kasih dukungan kecil, nominal bebas —
        ini murni sukarela, bukan wajib.
      </p>
      <img src="${QRIS_IMAGE_URL}" alt="QRIS Donasi" style="width:80%; border-radius:12px; margin:10px auto; display:block;" onerror="this.style.display='none'"/>
      <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Terima Kasih! Tutup</button>
    </div>
  `;
  document.body.appendChild(modal);
}

async function muatRatingSaya(userId) {
  const hasil = await apiGet('getRatings', { penjual_id: userId });
  if (!Array.isArray(hasil) || hasil.length === 0) return;

  const avg = (hasil.reduce((sum, r) => sum + Number(r.nilai), 0) / hasil.length).toFixed(1);
  const el = document.getElementById('badgeVerifikasi');
  el.insertAdjacentHTML(
    'afterend',
    `<p style="margin:6px 0 0;"><span class="rating-stars"><svg viewBox="0 0 24 24" style="width:15px;height:15px;fill:var(--color-accent);"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg><span class="rating-text" style="font-size:0.8rem;">${avg} dari ${hasil.length} ulasan</span></span></p>`
  );
}

muatProfil();
