// ============================================================
// PENGUMUMAN.JS — logika untuk pengumuman.html
// ============================================================

async function muatPengumuman() {
  const el = document.getElementById('daftarPengumuman');
  el.innerHTML = skeletonRowsPengumuman(3);

  const hasil = await apiGet('getPengumuman');

  if (hasil && hasil.error) {
    el.innerHTML = `<p class="empty-state">⚠️ ${hasil.error}</p>`;
    return;
  }

  if (!Array.isArray(hasil) || hasil.length === 0) {
    el.innerHTML = '<p class="empty-state">Belum ada pengumuman. Jadilah yang pertama posting!</p>';
    return;
  }

  el.innerHTML = hasil.map(pengumumanKeItem).join('');
}

function skeletonRowsPengumuman(jumlah) {
  return Array(jumlah).fill(0).map(() => `
    <div class="skeleton-row" style="flex-direction:column; align-items:stretch;">
      <div class="skeleton-block line" style="height:14px; width:40%;"></div>
      <div class="skeleton-block line" style="margin-top:8px;"></div>
      <div class="skeleton-block line short"></div>
    </div>
  `).join('');
}

const LABEL_JENIS = {
  kerja_bakti: '🧹 Kerja Bakti',
  kajian: '🕌 Kajian',
  kehilangan: '🔍 Kehilangan',
  lainnya: '📌 Lainnya',
};

function pengumumanKeItem(p) {
  const jenisKey = p.jenis || 'lainnya';
  const waktu = new Date(p.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return `
    <div class="pengumuman-item">
      <span class="jenis-pill jenis-${jenisKey}">${LABEL_JENIS[jenisKey] || '📌 Lainnya'}</span>
      <h3 style="margin:4px 0 4px; font-size:1rem;">${p.judul}</h3>
      ${p.foto_url ? `<img src="${p.foto_url}" onerror="this.style.display='none'" />` : ''}
      <p style="font-size:0.87rem; line-height:1.6; margin:6px 0;">${p.isi}</p>
      <p style="font-size:0.75rem; color:var(--color-muted); margin:6px 0 0;">
        Oleh ${p.nama_pengirim || 'Warga'} · ${waktu}
      </p>
    </div>
  `;
}

// ------------------------------------------------------------
// FORM BUAT PENGUMUMAN
// ------------------------------------------------------------
document.getElementById('btnBukaForm').addEventListener('click', async () => {
  const user = await requireUser();
  if (!user) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <h3 style="margin-top:0;">📢 Buat Pengumuman</h3>
      <div class="form-group">
        <label>Jenis</label>
        <select id="jenisPengumuman">
          <option value="kerja_bakti">🧹 Kerja Bakti</option>
          <option value="kajian">🕌 Kajian</option>
          <option value="kehilangan">🔍 Kehilangan Barang</option>
          <option value="lainnya">📌 Lainnya</option>
        </select>
      </div>
      <div class="form-group">
        <label>Judul</label>
        <input type="text" id="judulPengumuman" placeholder="mis. Kerja Bakti RT 03 Minggu Pagi" />
      </div>
      <div class="form-group">
        <label>Isi</label>
        <textarea id="isiPengumuman" rows="4" placeholder="Detail lengkap..."></textarea>
      </div>
      <div class="form-group">
        <label>Link Foto (opsional)</label>
        <input type="url" id="fotoPengumuman" placeholder="https://..." />
      </div>
      <button class="btn btn-primary" id="btnKirimPengumuman" style="margin-bottom:8px;">Posting</button>
      <button class="btn btn-secondary" id="btnBatalPengumuman">Batal</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('btnBatalPengumuman').addEventListener('click', () => modal.remove());

document.getElementById('btnKirimPengumuman').addEventListener('click', async (e) => {
    const judul = document.getElementById('judulPengumuman').value.trim();
    const isi = document.getElementById('isiPengumuman').value.trim();

    if (!judul || !isi) {
      tampilkanToast('Judul dan isi wajib diisi', 'error');
      return;
    }

    const btn = e.target;
    btn.disabled = true;
    btn.textContent = 'Mengirim...';

    const result = await apiPost('addPengumuman', {
      user_id: user.user_id,
      nama_pengirim: user.nama,
      jenis: document.getElementById('jenisPengumuman').value,
      judul,
      isi,
      foto_url: document.getElementById('fotoPengumuman').value,
    });

    if (result.error) {
      tampilkanToast(result.error, 'error');
      btn.disabled = false;
      btn.textContent = 'Posting';
      return;
    }

    modal.remove();
    tampilkanToast('Pengumuman berhasil diposting!', 'success');
    muatPengumuman();
  });
});

muatPengumuman();
