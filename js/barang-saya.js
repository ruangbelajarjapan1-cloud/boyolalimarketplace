// ============================================================
// BARANG-SAYA.JS — logika untuk barang-saya.html
// ============================================================

async function muatBarangSaya() {
  const container = document.getElementById('listContainer');

  const user = await requireUser();
  if (!user) return; // requireUser sudah redirect ke daftar.html kalau belum login

  const items = await apiGet('getMyProducts', { user_id: user.user_id });

  if (items && items.error) {
    container.innerHTML = `<p class="empty-state">⚠️ ${items.error}</p>`;
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `
      <p class="empty-state">Anda belum upload barang apa pun.</p>
      <a class="btn btn-primary" href="upload.html">Upload Barang Pertama</a>
    `;
    return;
  }

  container.innerHTML = items.map(itemKeBaris).join('');
}

function itemKeBaris(p) {
  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  const terjual = p.status === 'Terjual';

  return `
    <div class="my-item">
      <img src="${fotoUrl}" onerror="this.src='img/placeholder.svg'" />
      <div style="flex:1">
        <span class="status-pill ${terjual ? 'status-terjual' : 'status-tersedia'}">
          ${terjual ? 'Terjual' : 'Tersedia'}
        </span>
        <p style="margin:0; font-weight:600;">${p.nama_barang}</p>
        <p style="margin:0; color: var(--color-primary-dark); font-weight:700;">Rp${harga}</p>
        <div class="aksi">
          <button onclick="location.href='produk.html?id=${p.product_id}'">Lihat</button>
          ${
            terjual
              ? `<button onclick="ubahStatus('${p.product_id}', false)">Tandai Tersedia Lagi</button>`
              : `<button onclick="ubahStatus('${p.product_id}', true)">Tandai Terjual</button>`
          }
        </div>
      </div>
    </div>
  `;
}

async function ubahStatus(product_id, terjual) {
  const aksi = terjual ? 'markDone' : 'markAvailable';
  const result = await apiPost(aksi, { product_id });
  if (result.error) return alert(result.error);
  muatBarangSaya();
}

muatBarangSaya();
