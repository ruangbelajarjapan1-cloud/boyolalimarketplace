// ============================================================
// RIWAYAT.JS — logika untuk riwayat.html
// ============================================================

let userSaatIni = null;

async function muatRiwayat() {
  const container = document.getElementById('listContainer');
  container.innerHTML = skeletonRows(3);
  userSaatIni = await requireUser();
  if (!userSaatIni) return;

  const items = await apiGet('getRiwayatPembelian', { user_id: userSaatIni.user_id });

  if (items && items.error) {
    container.innerHTML = `<p class="empty-state">⚠️ ${items.error}</p>`;
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Belum ada riwayat pembelian.<br>Riwayat muncul otomatis kalau Anda pernah chat penjual dan barangnya sudah ditandai Terjual.</p>
        <a href="index.html" class="btn btn-primary" style="max-width:220px; margin:12px auto 0;">Jelajah Barang</a>
      </div>
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

  return `
    <div class="riwayat-item">
      <img src="${fotoUrl}" loading="lazy" onerror="this.src='img/placeholder.svg'" />
      <div style="flex:1">
        <p style="margin:0; font-weight:600;">${p.nama_barang}</p>
        <p style="margin:0; font-size:0.8rem; color:var(--color-muted);">Penjual: ${p.penjual_nama || '-'} · Rp${harga}</p>
        ${
          p.sudah_dirating
            ? '<span class="badge badge-verified" style="margin-top:6px;">✅ Sudah diberi rating</span>'
            : `<button class="btn btn-secondary" style="margin-top:8px; padding:8px; font-size:0.8rem;" onclick="bukaFormRating('${p.product_id}', '${p.user_id}', '${p.nama_barang.replace(/'/g, '')}')">⭐ Beri Rating</button>`
        }
      </div>
    </div>
  `;
}

function bukaFormRating(productId, penjualId, namaBarang) {
  let nilaiTerpilih = 0;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <h3 style="margin-top:0; text-align:center;">Beri Rating</h3>
      <p style="text-align:center; font-size:0.85rem; color:var(--color-muted);">Untuk transaksi: <strong>${namaBarang}</strong></p>
      <div class="star-input" id="starInput">
        ${[1,2,3,4,5].map((n) => `
          <svg data-nilai="${n}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
        `).join('')}
      </div>
      <div class="form-group">
        <textarea id="komentarRating" rows="3" placeholder="Ceritakan pengalaman Anda (opsional)"></textarea>
      </div>
      <button class="btn btn-primary" id="btnKirimRating" style="margin-bottom:8px;">Kirim Rating</button>
      <button class="btn btn-secondary" id="btnBatalRating">Batal</button>
    </div>
  `;
  document.body.appendChild(modal);

  const stars = modal.querySelectorAll('#starInput svg');
  stars.forEach((star) => {
    star.addEventListener('click', () => {
      nilaiTerpilih = Number(star.dataset.nilai);
      stars.forEach((s) => s.classList.toggle('filled', Number(s.dataset.nilai) <= nilaiTerpilih));
    });
  });

  modal.querySelector('#btnBatalRating').addEventListener('click', () => modal.remove());
  modal.querySelector('#btnKirimRating').addEventListener('click', async () => {
    if (nilaiTerpilih === 0) {
      tampilkanToast('Tap bintang dulu untuk kasih nilai.', 'error');
      return;
    }

    await apiPost('addRating', {
      product_id: productId,
      penjual_id: penjualId,
      pembeli_id: userSaatIni.user_id,
      nilai: nilaiTerpilih,
      komentar: modal.querySelector('#komentarRating').value,
    });

    modal.remove();
    tampilkanToast('Terima kasih atas rating Anda!', 'success');
    muatRiwayat();
  });
}

muatRiwayat();
