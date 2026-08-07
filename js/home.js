// ============================================================
// HOME.JS — logika untuk index.html
// ============================================================

let kategoriAktif = '';

tampilkanSapaan();

function tampilkanSapaan() {
  const user = getCurrentUser();
  const jam = new Date().getHours();
  const waktu = jam < 11 ? 'Selamat pagi' : jam < 15 ? 'Selamat siang' : jam < 18 ? 'Selamat sore' : 'Selamat malam';
  document.getElementById('greeting').textContent = user
    ? `${waktu}, ${user.nama.split(' ')[0]} 👋`
    : 'Marketplace Boyolali';
}

function skeletonCards() {
  return Array(6)
    .fill(0)
    .map(
      () => `
      <div class="skeleton-card">
        <div class="skeleton-block img"></div>
        <div class="skeleton-block line"></div>
        <div class="skeleton-block line short"></div>
      </div>
    `
    )
    .join('');
}

async function muatProduk() {
  const grid = document.getElementById('productGrid');
  const featuredSection = document.getElementById('featuredSection');
  const gridTitle = document.getElementById('gridTitle');
  grid.innerHTML = skeletonCards();
  featuredSection.innerHTML = '';

  const params = {};
  if (kategoriAktif) params.kategori = kategoriAktif;
  const q = document.getElementById('searchInput').value.trim();
  if (q) params.q = q;
  const kabupaten = document.getElementById('kabupatenFilter').value;
  if (kabupaten) params.kabupaten = kabupaten;

  const produkList = await apiGet('getProducts', params);

  if (produkList && produkList.error) {
    grid.innerHTML = `<p class="empty-state">⚠️ ${pesanErrorRamah(produkList.error)}</p>`;
    gridTitle.style.display = 'none';
    return;
  }

  if (!Array.isArray(produkList) || produkList.length === 0) {
    gridTitle.style.display = 'none';
    grid.innerHTML = tampilanKosong();
    return;
  }

  gridTitle.style.display = 'block';

  const unggulan = produkList.filter((p) => p.unggulan_aktif);
  const biasa = produkList.filter((p) => !p.unggulan_aktif);

  if (unggulan.length > 0) {
    featuredSection.innerHTML = `
      <p class="section-title">⭐ Listing Unggulan</p>
      <div class="featured-row">
        ${unggulan.map(produkKeCardKecil).join('')}
      </div>
    `;
  }

  gridTitle.textContent = unggulan.length > 0 ? 'Barang Lainnya' : 'Barang Terbaru';
  grid.innerHTML = biasa.length > 0 ? biasa.map(produkKeCard).join('') : '<p class="empty-state">Tidak ada barang lain di kategori/wilayah ini.</p>';
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
  if (err === 'setup_needed') {
    return 'Backend belum disambungkan. Lihat pesan merah di atas untuk cara memperbaikinya.';
  }
  return err;
}

function produkKeCard(p, i) {
  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  const badgeVerif = p.penjual_terverifikasi ? '<span class="badge badge-verified">✅ Terverifikasi</span>' : '';
  const delay = (i % 6) * 0.04;
  return `
    <a class="product-card" style="animation-delay:${delay}s" href="produk.html?id=${encodeURIComponent(p.product_id)}">
      <img src="${fotoUrl}" alt="${p.nama_barang}" onerror="this.src='img/placeholder.svg'"/>
      <div class="info">
        <div class="badges">${badgeVerif}</div>
        <p class="nama">${p.nama_barang}</p>
        <p class="harga">Rp${harga}</p>
        <p class="lokasi">📍 ${p.lokasi || '-'}, ${p.kabupaten || ''}</p>
      </div>
    </a>
  `;
}

function produkKeCardKecil(p) {
  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  return `
    <a class="featured-card" href="produk.html?id=${encodeURIComponent(p.product_id)}">
      <span class="badge badge-featured" style="position:absolute; top:8px; left:8px;">⭐ Unggulan</span>
      <img src="${fotoUrl}" alt="${p.nama_barang}" onerror="this.src='img/placeholder.svg'"/>
      <div class="info">
        <p class="nama">${p.nama_barang}</p>
        <p class="harga">Rp${harga}</p>
      </div>
    </a>
  `;
}

async function muatIklan() {
  const banner = document.getElementById('adsBanner');
  const iklanList = await apiGet('getAds');

  if (!Array.isArray(iklanList) || iklanList.length === 0) {
    banner.innerHTML = '';
    return;
  }

  const iklan = iklanList[0];
  banner.innerHTML = `
    <a class="ads-banner" href="${iklan.link_tujuan || '#'}" target="_blank" rel="noopener">
      <img src="${iklan.gambar_url}" alt="${iklan.nama_pengiklan || 'Iklan'}" />
      <span class="ads-label">Iklan</span>
    </a>
  `;
}

document.getElementById('kabupatenFilter').addEventListener('change', muatProduk);
muatIklan();

document.getElementById('categoryChips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  kategoriAktif = chip.dataset.kategori;
  muatProduk();
});

let timer;
document.getElementById('searchInput').addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(muatProduk, 400);
});

muatProduk();
