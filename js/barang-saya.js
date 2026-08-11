// ============================================================
// BARANG-SAYA.JS — logika untuk barang-saya.html
// ============================================================

async function muatBarangSaya() {
  const container = document.getElementById('listContainer');
  container.innerHTML = skeletonRows(3);

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

function skeletonRows(jumlah) {
  return Array(jumlah).fill(0).map(() => `
    <div class="skeleton-row">
      <div class="skeleton-block avatar"></div>
      <div style="flex:1;">
        <div class="skeleton-block text" style="margin-bottom:8px;"></div>
        <div class="skeleton-block text short"></div>
      </div>
    </div>
  `).join('');
}

function itemKeBaris(p) {
  const fotoUrl = p.foto_url || 'img/placeholder.svg';
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  const terjual = p.status === 'Terjual';
  const sudahUnggulan = p.unggulan === true;

  return `
    <div class="my-item">
      <img src="${fotoUrl}" onerror="this.src='img/placeholder.svg'" />
      <div style="flex:1">
        <span class="status-pill ${terjual ? 'status-terjual' : 'status-tersedia'}">
          ${terjual ? 'Terjual' : 'Tersedia'}
        </span>
        ${sudahUnggulan ? '<span class="badge badge-featured">⭐ Unggulan</span>' : ''}
        ${p.penjual_toko_aktif ? '<span class="badge badge-toko">🏪 Toko</span>' : ''}
        <p style="margin:0; font-weight:600;">${p.nama_barang}</p>
        <p style="margin:0; color: var(--color-primary-dark); font-weight:700;">Rp${harga}</p>
        <div class="aksi">
          <button onclick="location.href='produk.html?id=${p.product_id}'">Lihat</button>
          <button onclick="location.href='edit.html?id=${p.product_id}'">✏️ Edit</button>
          ${
            terjual
              ? `<button onclick="ubahStatus('${p.product_id}', false)">Tandai Tersedia Lagi</button>`
              : `<button onclick="ubahStatus('${p.product_id}', true)">Tandai Terjual</button>`
          }
          ${
            !terjual && !sudahUnggulan
              ? `<button onclick="tampilkanFormUnggulan('${p.product_id}', '${p.nama_barang.replace(/'/g, "")}')" style="background:#fdf0d9; border-color:var(--color-accent-dark); color:var(--color-accent-dark);">⭐ Jadikan Unggulan</button>`
              : ''
          }
          ${
            !terjual
              ? `<button onclick="tampilkanFormSundul('${p.product_id}', '${p.nama_barang.replace(/'/g, "")}')" style="background:#e0f0ff; border-color:#1a5fa0; color:#1a5fa0;">🚀 Sundul</button>`
              : ''
          }
          <button onclick="hapusBarang('${p.product_id}')" style="border-color:#c0392b; color:#c0392b;">🗑️ Hapus</button>
        </div>
      </div>
    </div>
  `;
}

function tampilkanFormUnggulan(productId, namaBarang) {
  const hargaFormat = HARGA_UNGGULAN.toLocaleString('id-ID');
  const pesanWa = encodeURIComponent(
    `Halo, saya mau jadikan barang "${namaBarang}" (ID: ${productId}) sebagai Listing Unggulan. Saya sudah transfer Rp${hargaFormat} untuk ${DURASI_UNGGULAN_HARI} hari. Ini bukti transfernya:`
  );
  const linkWa = `https://wa.me/${NOMOR_WA_ADMIN}?text=${pesanWa}`;

  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:100; padding:20px;';
  modal.innerHTML = `
    <div style="background:white; border-radius:var(--radius-lg); padding:20px; max-width:360px; width:100%;">
      <h3 style="margin-top:0;">⭐ Jadikan Listing Unggulan</h3>
      <p style="font-size:0.9rem; color:var(--color-muted);">
        Barang <strong>${namaBarang}</strong> akan tampil di posisi teratas Home selama
        <strong>${DURASI_UNGGULAN_HARI} hari</strong>.
      </p>
      <p style="font-size:1.3rem; font-weight:800; color:var(--color-accent-dark); font-family:'Plus Jakarta Sans',sans-serif;">
        Rp${hargaFormat}
      </p>
      <div class="info-note">
        <strong>${INFO_PEMBAYARAN}:</strong>
        <img src="${QRIS_IMAGE_URL}" alt="QRIS Pembayaran" style="width:100%; border-radius:12px; margin-top:8px; display:block;" onerror="this.style.display='none'"/>
      </div>
      <p style="font-size:0.85rem;">Setelah transfer, kirim bukti bayar via WhatsApp — listing Anda akan diaktifkan manual dalam waktu singkat.</p>
      <a href="${linkWa}" target="_blank" class="btn btn-primary" style="margin-bottom:8px;">Kirim Bukti Bayar via WhatsApp</a>
      <button class="btn btn-secondary" onclick="this.closest('div[style*=fixed]').remove()">Batal</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function tampilkanFormSundul(productId, namaBarang) {
  const hargaFormat = HARGA_SUNDUL.toLocaleString('id-ID');
  const pesanWa = encodeURIComponent(
    `Halo, saya mau SUNDUL barang "${namaBarang}" (ID: ${productId}) biar naik ke atas urutan Terbaru. Saya sudah transfer Rp${hargaFormat}. Ini bukti transfernya:`
  );
  const linkWa = `https://wa.me/${NOMOR_WA_ADMIN}?text=${pesanWa}`;

  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:100; padding:20px;';
  modal.innerHTML = `
    <div style="background:white; border-radius:var(--radius-lg); padding:20px; max-width:360px; width:100%;">
      <h3 style="margin-top:0;">🚀 Sundul Listing</h3>
      <p style="font-size:0.9rem; color:var(--color-muted);">
        Barang <strong>${namaBarang}</strong> akan langsung pindah ke posisi
        paling atas urutan "Terbaru" — sekali bayar, tanpa langganan.
      </p>
      <p style="font-size:1.3rem; font-weight:800; color:#1a5fa0; font-family:'Plus Jakarta Sans',sans-serif;">
        Rp${hargaFormat}
      </p>
      <div class="info-note">
        <strong>${INFO_PEMBAYARAN}:</strong>
        <img src="${QRIS_IMAGE_URL}" alt="QRIS Pembayaran" style="width:100%; border-radius:12px; margin-top:8px; display:block;" onerror="this.style.display='none'"/>
      </div>
      <p style="font-size:0.85rem;">Setelah transfer, kirim bukti bayar via WhatsApp — barang Anda akan disundul manual dalam waktu singkat.</p>
      <a href="${linkWa}" target="_blank" class="btn btn-primary" style="margin-bottom:8px; background:#1a5fa0; box-shadow:none;">Kirim Bukti Bayar via WhatsApp</a>
      <button class="btn btn-secondary" onclick="this.closest('div[style*=fixed]').remove()">Batal</button>
    </div>
  `;
  document.body.appendChild(modal);
}

async function ubahStatus(product_id, terjual) {
  const aksi = terjual ? 'markDone' : 'markAvailable';
  const result = await apiPost(aksi, { product_id });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast(terjual ? 'Ditandai Terjual' : 'Ditandai Tersedia lagi', 'success');
  muatBarangSaya();
}

async function hapusBarang(product_id) {
  const yakin = await tampilkanKonfirmasi('Barang ini akan dihapus permanen dan tidak bisa dibatalkan.', 'Hapus Barang?');
  if (!yakin) return;

  const user = getCurrentUser();
  const result = await apiPost('deleteProduct', { product_id, user_id: user.user_id });

  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('Barang berhasil dihapus', 'success');
  muatBarangSaya();
}

muatBarangSaya();
