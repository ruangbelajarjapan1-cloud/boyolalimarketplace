// ============================================================
// HOME.JS — logika untuk index.html
// ============================================================

let kategoriAktif = '';
let semuaProdukTerakhir = [];
let daftarFavoritSaya = [];

// ------------------------------------------------------------
// SPLASH SCREEN
// ------------------------------------------------------------
setTimeout(() => {
  document.getElementById('splashScreen').classList.add('hide');
}, 900);

// ------------------------------------------------------------
// ONBOARDING — cuma tampil sekali
// ------------------------------------------------------------
const SLIDE_ONBOARDING = [
  { icon: '🔍', judul: 'Cari barang di sekitar Anda', teks: 'Lihat listing warga Boyolali & sekitarnya, sesuai kecamatan atau kabupaten Anda.' },
  { icon: '💬', judul: 'Chat aman dengan tetangga', teks: 'Tanya-jawab langsung dengan penjual/pembeli sebelum sepakat transaksi.' },
  { icon: '🤝', judul: 'COD sesuai kesepakatan sendiri', teks: 'Waktu & lokasi ketemu Anda atur sendiri dengan lawan bicara. Utamakan tempat umum yang ramai.' },
];

let onbIndex = 0;

function mulaiOnboardingJikaPerlu() {
  if (localStorage.getItem('onboardingSelesai')) {
    tampilkanPilihWilayahJikaPerlu();
    return;
  }
  tampilkanSlideOnboarding();
}

function tampilkanSlideOnboarding() {
  document.getElementById('onboardingArea').innerHTML = '';
  const s = SLIDE_ONBOARDING[onbIndex];
  const isTerakhir = onbIndex === SLIDE_ONBOARDING.length - 1;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'modalOnboarding';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="onb-slide">
        <div class="onb-icon">${s.icon}</div>
        <h3>${s.judul}</h3>
        <p>${s.teks}</p>
      </div>
      <div class="onb-dots">
        ${SLIDE_ONBOARDING.map((_, i) => `<span class="${i === onbIndex ? 'active' : ''}"></span>`).join('')}
      </div>
      <div class="onb-actions">
        <button class="onb-skip" id="onbSkip">Lewati</button>
        <button class="onb-next" id="onbNext">${isTerakhir ? 'Mulai' : 'Lanjut'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('onbSkip').addEventListener('click', selesaiOnboarding);
  document.getElementById('onbNext').addEventListener('click', () => {
    modal.remove();
    if (isTerakhir) {
      selesaiOnboarding();
    } else {
      onbIndex++;
      tampilkanSlideOnboarding();
    }
  });
}

function selesaiOnboarding() {
  localStorage.setItem('onboardingSelesai', '1');
  const modalLama = document.getElementById('modalOnboarding');
  if (modalLama) modalLama.remove();
  tampilkanPilihWilayahJikaPerlu();
}

// ------------------------------------------------------------
// TANYA WILAYAH DI AWAL
// ------------------------------------------------------------
function tampilkanPilihWilayahJikaPerlu() {
  const wilayahTersimpan = localStorage.getItem('wilayahPilihan');
  if (wilayahTersimpan) {
    document.getElementById('kabupatenFilter').value = wilayahTersimpan;
    return;
  }

  const opsi = ['Boyolali', 'Surakarta (Solo)', 'Sukoharjo', 'Karanganyar', 'Sragen', 'Klaten', 'Semarang', 'Salatiga', 'Wonogiri'];

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="onb-slide">
        <div class="onb-icon">📍</div>
        <h3>Anda di kabupaten/kota mana?</h3>
        <p>Biar barang yang muncul pertama kali langsung relevan dengan daerah Anda.</p>
      </div>
      <div class="form-group">
        <select id="pilihWilayahAwal">
          ${opsi.map((o) => `<option value="${o}">${o}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-primary" id="btnSimpanWilayah">Mulai Jelajah</button>
      <button class="onb-skip" id="btnSemuaWilayah" style="display:block; margin:10px auto 0;">Lihat semua wilayah saja</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('btnSimpanWilayah').addEventListener('click', () => {
    const pilihan = document.getElementById('pilihWilayahAwal').value;
    localStorage.setItem('wilayahPilihan', pilihan);
    document.getElementById('kabupatenFilter').value = pilihan;
    modal.remove();
    muatProduk();
  });

  document.getElementById('btnSemuaWilayah').addEventListener('click', () => {
    localStorage.setItem('wilayahPilihan', '');
    modal.remove();
  });
}

// ------------------------------------------------------------
// SAPAAN & AVATAR HEADER
// ------------------------------------------------------------
function tampilkanSapaan() {
  const user = getCurrentUser();
  const jam = new Date().getHours();
  const waktu = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam';
  document.getElementById('greeting').textContent = user
    ? `${waktu}, ${user.nama.split(' ')[0]} 👋`
    : 'Dulur';

  const avatar = document.getElementById('headerAvatar');
  if (user) avatar.textContent = user.nama.charAt(0).toUpperCase();
}

// ------------------------------------------------------------
// PRODUK — muat, filter, urutkan
// ------------------------------------------------------------
function skeletonCards() {
  return Array(6).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-block img"></div>
      <div class="skeleton-block line"></div>
      <div class="skeleton-block line short"></div>
    </div>
  `).join('');
}

async function muatFavoritSaya() {
  const user = getCurrentUser();
  if (!user) { daftarFavoritSaya = []; return; }
  const hasil = await apiGet('getFavorites', { user_id: user.user_id });
  daftarFavoritSaya = Array.isArray(hasil) ? hasil.map((p) => p.id) : [];
}

async function muatProduk() {
  const grid = document.getElementById('productGrid');
  const featuredSection = document.getElementById('featuredSection');
  const gridTitle = document.getElementById('gridTitle');
  grid.innerHTML = skeletonCards();
  featuredSection.innerHTML = '';

  const params = {};
  const hibahAktif = kategoriAktif === 'HIBAH';
  if (kategoriAktif && !hibahAktif) params.kategori = kategoriAktif;
  const q = document.getElementById('searchInput').value.trim();
  if (q) params.q = q;
  const kabupaten = document.getElementById('kabupatenFilter').value;
  if (kabupaten) params.kabupaten = kabupaten;

 const [, produkListHasil] = await Promise.all([
    muatFavoritSaya(),
    apiGet('getProducts', params),
  ]);
  let produkList = produkListHasil;

  if (Array.isArray(produkList)) {
    const kecamatanEl = document.getElementById('kecamatanFilter');
    const kecamatanTerpilih = kecamatanEl.value;
    const daftarKecamatan = [...new Set(produkList.map((p) => p.lokasi).filter(Boolean))].sort();
    kecamatanEl.innerHTML =
      '<option value="">Semua Kecamatan</option>' +
      daftarKecamatan.map((k) => `<option value="${k}" ${k === kecamatanTerpilih ? 'selected' : ''}>${k}</option>`).join('');
    if (kecamatanTerpilih) produkList = produkList.filter((p) => p.lokasi === kecamatanTerpilih);
  }

  if (produkList && produkList.error) {
    grid.innerHTML = `<p class="empty-state">⚠️ ${pesanErrorRamah(produkList.error)}</p>`;
    gridTitle.style.display = 'none';
    return;
  }

  if (!Array.isArray(produkList)) produkList = [];

  if (hibahAktif) produkList = produkList.filter((p) => Number(p.harga) === 0);

  const hargaMax = document.getElementById('hargaMaxFilter').value;
  if (hargaMax) produkList = produkList.filter((p) => Number(p.harga) <= Number(hargaMax));

  const urutan = document.getElementById('urutkanFilter').value;
  if (urutan === 'termurah') produkList.sort((a, b) => Number(a.harga) - Number(b.harga));
  if (urutan === 'termahal') produkList.sort((a, b) => Number(b.harga) - Number(a.harga));
  if (urutan === 'terbaru') produkList.sort((a, b) => new Date(b.tanggal_upload) - new Date(a.tanggal_upload));

  semuaProdukTerakhir = produkList;

  if (produkList.length === 0) {
    gridTitle.style.display = 'none';
    grid.innerHTML = tampilanKosong();
    return;
  }

  gridTitle.style.display = 'block';

  const unggulan = produkList.filter((p) => p.unggulan_aktif);
  const biasa = produkList.filter((p) => !p.unggulan_aktif);

  if (unggulan.length > 0 && urutan === 'terbaru') {
    featuredSection.innerHTML = `
      <p class="section-title">⭐ Listing Unggulan</p>
      <div class="featured-row">${unggulan.map(produkKeCardKecil).join('')}</div>
    `;
    gridTitle.textContent = 'Barang Lainnya';
    grid.innerHTML = biasa.length > 0 ? biasa.map(produkKeCard).join('') : '<p class="empty-state">Tidak ada barang lain di kategori/wilayah ini.</p>';
  } else {
    gridTitle.textContent = 'Barang Terbaru';
    grid.innerHTML = produkList.map(produkKeCard).join('');
  }

  pasangEventFavorit();
}

function tampilanKosong() {
  return `
    <div class="empty-state" style="grid-column: 1 / -1;">
      <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.35; margin-bottom:8px;">
        <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/>
      </svg>
      <p>Belum ada barang di sini.<br>Jadilah yang pertama upload!</p>
      <a href="upload.html" class="btn btn-primary" style="max-width:220px; margin:12px auto 0;">Upload Sekarang</a>
    </div>
  `;
}

function pesanErrorRamah(err) {
  if (err === 'setup_needed') return 'Backend belum disambungkan. Lihat pesan merah di atas untuk cara memperbaikinya.';
  return err;
}

function ratingHtml(avg, count) {
  if (!count) return '';
  return `
    <span class="rating-stars">
      <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
      <span class="rating-text">${avg} (${count})</span>
    </span>
  `;
}

function produkKeCard(p, i) {
  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const gratis = Number(p.harga) === 0;
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  const badgeVerif = p.penjual_terverifikasi ? '<span class="badge badge-verified">✅ Terverifikasi</span>' : '';
  const badgeGratis = gratis ? '<span class="badge badge-hibah">🎁 Hibah</span>' : '';
  const badgeBaru = (!p.penjual_terverifikasi && p.penjual_akun_baru) ? '<span class="badge badge-baru">🆕 Akun Baru</span>' : '';
  const badgeToko = p.penjual_toko_aktif ? '<span class="badge badge-toko">🏪 Toko</span>' : '';
  const badgeResponCepat = p.penjual_respon_cepat ? '<span class="badge" style="background:#e0f7e9; color:#1a7a4c;">⚡ Respon Cepat</span>' : '';
  const badgeCepat = (p.butuh_cepat === true) ? '<span class="badge badge-cepat">🔴 Butuh Cepat</span>' : '';
  const badgeLama = (p.listing_lama === true) ? '<span class="badge badge-lama">🕒 Listing Lama</span>' : '';
  const delay = (i % 6) * 0.04;
 const favAktif = daftarFavoritSaya.indexOf(p.id) !== -1;

  return `
    <div class="product-card" style="animation-delay:${delay}s">
     <button class="fav-heart ${favAktif ? 'active' : ''}" data-id="${p.id}" aria-label="Favorit">
        <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
    <a href="produk.html?id=${encodeURIComponent(p.id)}">
   <img src="${fotoUrl}" alt="${escapeHtml(p.nama_barang)}" loading="lazy" onerror="this.src='img/placeholder.svg'"/>
        <div class="info">
          <div class="badges">${badgeGratis}${badgeVerif}${badgeToko}${badgeResponCepat}${badgeBaru}${badgeCepat}${badgeLama}</div>
          <p class="nama">${escapeHtml(p.nama_barang)}</p>
          <p class="${gratis ? 'harga-gratis' : 'harga'}">${gratis ? 'GRATIS untuk sesama 🎁' : 'Rp' + harga}</p>
          ${ratingHtml(p.penjual_rating_avg, p.penjual_rating_count)}
          <p class="lokasi">📍 ${escapeHtml(p.lokasi) || '-'}, ${escapeHtml(p.kabupaten) || ''}</p>
        </div>
      </a>
    </div>
  `;
}

function produkKeCardKecil(p) {
  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  return `
  <a class="featured-card" href="produk.html?id=${encodeURIComponent(p.id)}">
      <span class="badge badge-featured" style="position:absolute; top:8px; left:8px;">⭐ Unggulan</span>
      <img src="${fotoUrl}" alt="${escapeHtml(p.nama_barang)}" loading="lazy" onerror="this.src='img/placeholder.svg'"/>
      <div class="info">
        <p class="nama">${p.nama_barang}</p>
        <p class="harga">Rp${harga}</p>
      </div>
    </a>
  `;
}

// ------------------------------------------------------------
// FAVORIT
// ------------------------------------------------------------
function pasangEventFavorit() {
  document.querySelectorAll('.fav-heart').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const user = await requireUser();
      if (!user) return;

      const productId = btn.dataset.id;
      const aktif = btn.classList.contains('active');
      btn.classList.toggle('active');
      btn.classList.remove('beat');
      void btn.offsetWidth;
      btn.classList.add('beat');

      if (aktif) {
        await apiPost('removeFavorite', { user_id: user.user_id, product_id: productId });
      } else {
        await apiPost('addFavorite', { user_id: user.user_id, product_id: productId });
      }
    });
  });
}

// ------------------------------------------------------------
// IKLAN
// ------------------------------------------------------------
let iklanRotasi = [];
let indexIklanAktif = 0;
let intervalIklanRotasi = null;

async function muatIklan() {
  const banner = document.getElementById('adsBanner');
  const iklanList = await apiGet('getAds');

  if (intervalIklanRotasi) clearInterval(intervalIklanRotasi);

  if (!Array.isArray(iklanList) || iklanList.length === 0) {
    banner.innerHTML = bannerCtaPasangIklan();
    return;
  }

  // Gabung iklan asli + 1 slide ajakan pasang iklan, biar slot
  // "pasang iklan" tetap ikut berputar meski sudah ada iklan aktif.
  iklanRotasi = [...iklanList, { cta: true }];
  indexIklanAktif = 0;
  renderSlideIklan();

  if (iklanRotasi.length > 1) {
    intervalIklanRotasi = setInterval(() => {
      indexIklanAktif = (indexIklanAktif + 1) % iklanRotasi.length;
      renderSlideIklan();
    }, 5000);
  }
}

function renderSlideIklan() {
  const banner = document.getElementById('adsBanner');
  const item = iklanRotasi[indexIklanAktif];

  banner.style.transition = 'opacity 0.35s ease';
  banner.style.opacity = '0';

  setTimeout(() => {
    let html = item.cta
      ? bannerCtaPasangIklan()
      : `
        <a class="ads-banner" href="${item.link_tujuan || '#'}" target="_blank" rel="noopener">
          <img src="${escapeHtml(item.gambar_url)}" alt="${escapeHtml(item.nama_pengiklan) || 'Iklan'}" />
          <span class="ads-label">Iklan</span>
        </a>
      `;

    if (iklanRotasi.length > 1) {
      html += `
        <div style="display:flex; justify-content:center; gap:5px; margin-top:6px;">
          ${iklanRotasi.map((_, i) => `<span style="width:6px; height:6px; border-radius:50%; background:${i === indexIklanAktif ? 'var(--color-primary)' : '#ddd'};"></span>`).join('')}
        </div>
      `;
    }

    banner.innerHTML = html;
    banner.style.opacity = '1';
  }, 200);
}

function bannerCtaPasangIklan() {
  return `
    <a href="pasang-iklan.html" style="display:block; text-align:center; padding:14px; border-radius:var(--radius-lg); background:linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color:white; font-weight:700; text-decoration:none;">
      📢 Punya usaha di Boyolali? Pasang iklan di sini →
    </a>
  `;
}

// ------------------------------------------------------------
// EVENT LISTENERS
// ------------------------------------------------------------
document.getElementById('kabupatenFilter').addEventListener('change', muatProduk);
document.getElementById('urutkanFilter').addEventListener('change', muatProduk);
document.getElementById('hargaMaxFilter').addEventListener('change', muatProduk);
document.getElementById('kecamatanFilter').addEventListener('change', muatProduk);
document.getElementById('categoryChips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  kategoriAktif = chip.dataset.kategori;
  muatProduk();
});

document.getElementById('categoryChips').addEventListener('wheel', (e) => {
  if (e.deltaY === 0) return;
  e.preventDefault();
  e.currentTarget.scrollLeft += e.deltaY;
});

// Geser pakai klik-tahan-tarik mouse (buat pengguna PC/Laptop)
(function aktifkanDragScrollChip() {
  const chips = document.getElementById('categoryChips');
  let menggeser = false;
  let sudahGeserJauh = false;
  let mulaiX = 0;
  let scrollMula = 0;

  chips.addEventListener('mousedown', (e) => {
    menggeser = true;
    sudahGeserJauh = false;
    chips.classList.add('dragging');
    mulaiX = e.pageX;
    scrollMula = chips.scrollLeft;
  });

  window.addEventListener('mousemove', (e) => {
    if (!menggeser) return;
    const jarak = e.pageX - mulaiX;
    if (Math.abs(jarak) > 5) sudahGeserJauh = true;
    e.preventDefault();
    chips.scrollLeft = scrollMula - jarak;
  });

  window.addEventListener('mouseup', () => {
    menggeser = false;
    chips.classList.remove('dragging');
  });

  // Kalau tadi benar-benar digeser (bukan sekadar klik), batalkan klik chip
  // supaya kategori tidak ganti tidak sengaja
  chips.addEventListener('click', (e) => {
    if (sudahGeserJauh) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);
})();

let timer;
document.getElementById('searchInput').addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(muatProduk, 400);
});

// ------------------------------------------------------------
// MULAI
// ------------------------------------------------------------
tampilkanSapaan();
muatIklan();
muatProduk();
mulaiOnboardingJikaPerlu();
aktifkanPullToRefresh(async () => {
  await muatProduk();
  await muatIklan();
  tampilkanToast('Barang diperbarui', 'success');
});
