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
  const sudahUnggulan = p.unggulan === true;

  return `
    <div class="my-item">
      <img src="${fotoUrl}" onerror="this.src='img/placeholder.svg'" />
      <div style="flex:1">
        <span class="status-pill ${terjual ? 'status-terjual' : 'status-tersedia'}">
          ${terjual ? 'Terjual' : 'Tersedia'}
        </span>
        ${sudahUnggulan ? '<span class="badge badge-featured">⭐ Unggulan</span>' : ''}
        <p style="margin:0; font-weight:600;">${p.nama_barang}</p>
        <p style="margin:0; color: var(--color-primary-dark); font-weight:700;">Rp${harga}</p>
        <div class="aksi">
          <button onclick="location.href='produk.html?id=${p.product_id}'">Lihat</button>
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
        <strong>Cara bayar:</strong><br>${INFO_PEMBAYARAN}
      </div>
      <p style="font-size:0.85rem;">Setelah transfer, kirim bukti bayar via WhatsApp — listing Anda akan diaktifkan manual dalam waktu singkat.</p>
      <a href="${linkWa}" target="_blank" class="btn btn-primary" style="margin-bottom:8px;">Kirim Bukti Bayar via WhatsApp</a>
      <button class="btn btn-secondary" onclick="this.closest('div[style*=fixed]').remove()">Batal</button>
    </div>
  `;
  document.body.appendChild(modal);
}

async function ubahStatus(product_id, terjual) {
  const aksi = terjual ? 'markDone' : 'markAvailable';
  const result = await apiPost(aksi, { product_id });
  if (result.error) return alert(result.error);
  muatBarangSaya();
}

muatBarangSaya();
