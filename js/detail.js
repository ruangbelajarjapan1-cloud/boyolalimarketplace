// ============================================================
// DETAIL.JS — logika untuk produk.html
// ============================================================

async function muatDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('detailContainer');

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

  const badgeVerif = p.penjual_terverifikasi
    ? '<span class="badge badge-verified">✅ Penjual Terverifikasi</span>'
    : '';

  container.innerHTML = `
    <img class="detail-photo" src="${fotoUrl}" alt="${p.nama_barang}" onerror="this.src='img/placeholder.svg'" />
    <h2>${p.nama_barang}</h2>
    <p class="detail-harga">Rp${harga}</p>
    <p>📍 ${p.lokasi || '-'}, ${p.kabupaten || '-'} &nbsp;|&nbsp; Kategori: ${p.kategori || '-'}</p>
    <p>Dijual oleh: ${p.penjual_nama || 'Warga'} ${badgeVerif}</p>
    <p>${p.deskripsi || 'Tidak ada deskripsi.'}</p>

    <div class="info-note">
      Serah terima & pembayaran dilakukan langsung antara Anda dan penjual/pembeli
      (COD). Disarankan bertemu di tempat umum/ramai. Aplikasi ini hanya
      menghubungkan Anda lewat chat — waktu dan lokasi ketemu silakan disepakati sendiri.
    </div>

    <a class="btn btn-primary" href="chat.html?productId=${encodeURIComponent(p.product_id)}&penjual=${encodeURIComponent(p.user_id)}">
      💬 Chat Penjual
    </a>
  `;
}

muatDetail();
