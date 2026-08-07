// ============================================================
// DETAIL.JS — logika untuk produk.html
// ============================================================

async function muatDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('detailContainer');
  const cta = document.getElementById('stickyCta');

  if (!id) {
    container.innerHTML = '<p class="empty-state">Produk tidak ditemukan.</p>';
    return;
  }

  const p = await apiGet('getProduct', { id });

  if (p.error) {
    const pesan = p.error === 'setup_needed'
      ? 'Backend belum disambungkan. Lihat pesan merah di atas.'
      : p.error;
    container.innerHTML = `<p class="empty-state">⚠️ ${pesan}</p>`;
    return;
  }

  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  const inisial = (p.penjual_nama || 'W').charAt(0).toUpperCase();
  const badgeVerif = p.penjual_terverifikasi
    ? '<span class="badge badge-verified">✅ Terverifikasi</span>'
    : '<span class="badge" style="background:#eee; color:var(--color-muted);">Belum Terverifikasi</span>';
  const terjual = p.status === 'Terjual';

  container.innerHTML = `
    <div style="position:relative;">
      <img class="detail-photo" src="${fotoUrl}" alt="${p.nama_barang}" onerror="this.src='img/placeholder.svg'" />
      ${terjual ? '<span class="badge" style="position:absolute; top:12px; left:12px; background:#20261f; color:white; font-size:0.78rem; padding:5px 10px;">TERJUAL</span>' : ''}
    </div>

    <h2 style="margin: 14px 0 4px;">${p.nama_barang}</h2>
    <p class="detail-harga">Rp${harga}</p>
    <p style="color:var(--color-muted); font-size:0.85rem; margin: 4px 0 16px;">
      📍 ${p.lokasi || '-'}, ${p.kabupaten || '-'} &nbsp;·&nbsp; ${p.kategori || '-'}
    </p>

    <div class="seller-card">
      <div class="seller-avatar">${inisial}</div>
      <div style="flex:1;">
        <p style="margin:0; font-weight:700;">${p.penjual_nama || 'Warga'}</p>
        ${badgeVerif}
      </div>
    </div>

    <p class="section-title" style="margin-top:18px;">Deskripsi</p>
    <p style="line-height:1.6; color: var(--color-ink);">${p.deskripsi || 'Tidak ada deskripsi.'}</p>

    <div class="info-note">
      Serah terima & pembayaran dilakukan langsung antara Anda dan penjual/pembeli
      (COD). Disarankan bertemu di tempat umum/ramai. Aplikasi ini hanya
      menghubungkan Anda lewat chat — waktu dan lokasi ketemu silakan disepakati sendiri.
    </div>
  `;

  cta.innerHTML = terjual
    ? `<div class="sticky-cta"><span class="btn" style="background:#eee; color:var(--color-muted);">Barang Ini Sudah Terjual</span></div>`
    : `
      <div class="sticky-cta">
        <a class="btn btn-primary" href="chat.html?productId=${encodeURIComponent(p.product_id)}&penjual=${encodeURIComponent(p.user_id)}">
          💬 Chat Penjual
        </a>
      </div>
    `;
}

muatDetail();
