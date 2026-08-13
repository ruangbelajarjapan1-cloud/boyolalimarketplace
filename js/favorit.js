// ============================================================
// FAVORIT.JS — logika untuk favorit.html
// ============================================================

async function muatFavorit() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = skeletonCardsFavorit();

  const user = await requireUser();
  if (!user) return;

  const hasil = await apiGet('getFavorites', { user_id: user.user_id });

  if (hasil && hasil.error) {
    grid.innerHTML = `<p class="empty-state">⚠️ ${hasil.error}</p>`;
    return;
  }

  if (!Array.isArray(hasil) || hasil.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <p>Belum ada barang favorit.<br>Tap ikon hati ❤️ di barang yang Anda suka.</p>
        <a href="index.html" class="btn btn-primary" style="max-width:220px; margin:12px auto 0;">Jelajah Barang</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = hasil.map(produkKeCardFavorit).join('');

  document.querySelectorAll('.fav-heart').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await apiPost('removeFavorite', { user_id: user.user_id, product_id: btn.dataset.id });
      muatFavorit();
    });
  });
}

function skeletonCardsFavorit() {
  return Array(4).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-block img"></div>
      <div class="skeleton-block line"></div>
      <div class="skeleton-block line short"></div>
    </div>
  `).join('');
}

function produkKeCardFavorit(p) {
  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const gratis = Number(p.harga) === 0;
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  const terjual = p.status === 'Terjual';

  return `
    <div class="product-card">
      <button class="fav-heart active" data-id="${p.id}" aria-label="Hapus dari favorit">
        <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
      <a href="produk.html?id=${encodeURIComponent(p.id)}">
        <img src="${fotoUrl}" alt="${p.nama_barang}" loading="lazy" onerror="this.src='img/placeholder.svg'"/>
        <div class="info">
          ${terjual ? '<span class="badge" style="background:#eee; color:var(--color-muted);">Terjual</span>' : ''}
          <p class="nama">${p.nama_barang}</p>
          <p class="${gratis ? 'harga-gratis' : 'harga'}">${gratis ? 'GRATIS 🎁' : 'Rp' + harga}</p>
          <p class="lokasi">📍 ${p.lokasi || '-'}, ${p.kabupaten || ''}</p>
        </div>
      </a>
    </div>
  `;
}

muatFavorit();
