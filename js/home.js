// ============================================================
// HOME.JS — logika untuk index.html
// ============================================================

let kategoriAktif = '';

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
  grid.innerHTML = skeletonCards();

  const params = {};
  if (kategoriAktif) params.kategori = kategoriAktif;
  const q = document.getElementById('searchInput').value.trim();
  if (q) params.q = q;
  const kabupaten = document.getElementById('kabupatenFilter').value;
  if (kabupaten) params.kabupaten = kabupaten;

  const produkList = await apiGet('getProducts', params);

  if (produkList && produkList.error) {
    grid.innerHTML = `<p class="empty-state">⚠️ ${pesanErrorRamah(produkList.error)}</p>`;
    return;
  }

  if (!Array.isArray(produkList) || produkList.length === 0) {
    grid.innerHTML = '<p class="empty-state">Belum ada barang. Jadilah yang pertama upload!</p>';
    return;
  }

  grid.innerHTML = produkList.map(produkKeCard).join('');
}

function pesanErrorRamah(err) {
  if (err === 'setup_needed') {
    return 'Backend belum disambungkan. Lihat pesan merah di atas untuk cara memperbaikinya.';
  }
  return err;
}

function produkKeCard(p) {
  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  const badgeUnggulan = p.unggulan_aktif ? '<span class="badge badge-featured">⭐ Unggulan</span>' : '';
  const badgeVerif = p.penjual_terverifikasi ? '<span class="badge badge-verified">✅ Terverifikasi</span>' : '';
  return `
    <a class="product-card" href="produk.html?id=${encodeURIComponent(p.product_id)}">
      <img src="${fotoUrl}" alt="${p.nama_barang}" onerror="this.src='img/placeholder.svg'"/>
      <div class="info">
        <div class="badges">${badgeUnggulan}${badgeVerif}</div>
        <p class="nama">${p.nama_barang}</p>
        <p class="harga">Rp${harga}</p>
        <p class="lokasi">📍 ${p.lokasi || '-'}, ${p.kabupaten || ''}</p>
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

  // Tampilkan 1 iklan (yang pertama aktif) sebagai banner sederhana
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

// Klik chip kategori
document.getElementById('categoryChips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  kategoriAktif = chip.dataset.kategori;
  muatProduk();
});

// Cari (ketik lalu tunggu sebentar, biar tidak nembak request tiap huruf)
let timer;
document.getElementById('searchInput').addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(muatProduk, 400);
});

muatProduk();
