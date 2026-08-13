// ============================================================
// DETAIL.JS — logika untuk produk.html
// ============================================================

let produkSaatIni = null;

async function muatDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('detailContainer');
  const cta = document.getElementById('stickyCta');

  container.innerHTML = `
    <div class="skeleton-block img" style="border-radius:var(--radius-lg); margin-bottom:14px;"></div>
    <div class="skeleton-block line" style="height:20px; margin:0 0 10px;"></div>
    <div class="skeleton-block line short" style="height:14px; margin:0 0 16px;"></div>
    <div class="skeleton-row"><div class="skeleton-block avatar"></div><div style="flex:1;"><div class="skeleton-block text"></div></div></div>
  `;

  if (!id) {
    container.innerHTML = '<p class="empty-state">Produk tidak ditemukan.</p>';
    return;
  }

  const p = await apiGet('getProduct', { id });

  if (p.error) {
    const pesan = p.error === 'setup_needed' ? 'Backend belum disambungkan. Lihat pesan merah di atas.' : p.error;
    container.innerHTML = `<p class="empty-state">⚠️ ${pesan}</p>`;
    return;
  }

  produkSaatIni = p;

  const gratis = Number(p.harga) === 0;
  const harga = Number(p.harga || 0).toLocaleString('id-ID');
  const inisial = (p.penjual_nama || 'W').charAt(0).toUpperCase();
  const badgeVerif = p.penjual_terverifikasi
    ? '<span class="badge badge-verified">✅ Terverifikasi</span>'
    : '<span class="badge" style="background:#eee; color:var(--color-muted);">Belum Terverifikasi</span>';
  const badgeBaru = (!p.penjual_terverifikasi && p.penjual_akun_baru)
    ? '<span class="badge badge-baru">🆕 Akun Baru</span>'
    : '';
  const badgeToko = p.penjual_toko_aktif ? '<span class="badge badge-toko">🏪 Toko</span>' : '';
  const badgeResponCepat = p.penjual_respon_cepat ? '<span class="badge" style="background:#e0f7e9; color:#1a7a4c;">⚡ Respon Cepat</span>' : '';
  const badgeCepat = (p.butuh_cepat === true) ? '<span class="badge badge-cepat">🔴 Butuh Cepat</span>' : '';
  const badgeLama = (p.listing_lama === true) ? '<span class="badge badge-lama">🕒 Listing Lama</span>' : '';
  const terjual = p.status === 'Terjual';

  const fotoList = [p.foto_url, p.foto_url_2, p.foto_url_3].filter((f) => f);
  const fotoTampil = fotoList.length > 0 ? fotoList : ['img/placeholder.svg'];

  const user = getCurrentUser();
  const favAktif = user ? await cekFavoritAktif(id, user.user_id) : false;

  container.innerHTML = `
    <div style="position:relative;">
      <div class="gallery-scroll" id="galleryScroll">
        ${fotoTampil.map((f) => `<img src="${f}" onerror="this.src='img/placeholder.svg'" />`).join('')}
      </div>
      ${fotoTampil.length > 1 ? `<div class="gallery-dots" id="galleryDots">${fotoTampil.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('')}</div>` : ''}
      ${terjual ? '<span class="badge" style="position:absolute; top:12px; left:12px; background:#20261f; color:white; font-size:0.78rem; padding:5px 10px;">TERJUAL</span>' : ''}
      <button class="fav-heart ${favAktif ? 'active' : ''}" id="favHeartDetail" style="top:12px; right:12px; width:38px; height:38px;">
        <svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
      </button>
    </div>

    <h2 style="margin: 14px 0 4px;">${p.nama_barang} ${badgeCepat}${badgeLama}</h2>
    <p class="${gratis ? 'harga-gratis' : 'detail-harga'}" style="${gratis ? 'font-size:1.5rem;' : ''}">${p.kategori === 'Donasi' ? '💚 Ajakan Donasi' : gratis ? '🎁 GRATIS untuk sesama' : 'Rp' + harga}</p>
    <p style="color:var(--color-muted); font-size:0.85rem; margin: 4px 0 6px;">
      📍 ${p.lokasi || '-'}, ${p.kabupaten || '-'} &nbsp;·&nbsp; ${p.kategori || '-'}
    </p>
    <p style="color:var(--color-muted); font-size:0.78rem; margin: 0 0 16px;">
      👁️ ${p.jumlah_dilihat || 1} orang melihat barang ini
    </p>

    <div class="seller-card">
      <div class="seller-avatar">${inisial}</div>
      <div style="flex:1;">
        <p style="margin:0; font-weight:700;">${p.penjual_nama || 'Warga'}</p>
        <div style="display:flex; gap:6px; align-items:center; margin-top:2px; flex-wrap:wrap;">
         ${badgeVerif}
          ${badgeToko}
          ${badgeResponCepat}
          ${badgeBaru}
          ${p.penjual_rating_count ? `<span class="rating-stars"><svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg><span class="rating-text">${p.penjual_rating_avg} (${p.penjual_rating_count} ulasan)</span></span>` : '<span class="rating-text">Belum ada ulasan</span>'}
        </div>
      </div>
    </div>

    ${badgeBaru ? '<div class="info-note" style="background:#fff4e0; border-color:#f5d99e; color:#a4700f;">🆕 Penjual ini baru bergabung minggu ini. Tetap hati-hati seperti biasa — utamakan COD di tempat umum, terutama untuk barang bernilai tinggi.</div>' : ''}

    <p class="section-title" style="margin-top:18px;">Deskripsi</p>
    <p style="line-height:1.6; color: var(--color-ink);">${p.deskripsi || 'Tidak ada deskripsi.'}</p>

    <div class="info-note">
      Serah terima & pembayaran dilakukan langsung antara Anda dan penjual/pembeli
      (COD). Disarankan bertemu di tempat umum/ramai. Aplikasi ini hanya
      menghubungkan Anda lewat chat — waktu dan lokasi ketemu silakan disepakati sendiri.
    </div>

    <div style="display:flex; gap:16px; margin: 4px 0 8px;">
      <button class="text-link-btn" id="btnShareWa">📤 Bagikan ke WhatsApp</button>
      <button class="text-link-btn" id="btnLaporkan">🚩 Laporkan Barang Ini</button>
    </div>
  `;

  pasangGalleryScroll(fotoTampil.length);
  pasangFavoritDetail(id);
  pasangShareWa(p);
  pasangLaporkan(p);

  cta.innerHTML = terjual
    ? `<div class="sticky-cta"><span class="btn" style="background:#eee; color:var(--color-muted);">Barang Ini Sudah Terjual</span></div>`
    : `
      <div class="sticky-cta">
        <a class="btn btn-primary" href="chat.html?productId=${encodeURIComponent(p.id)}&penjual=${encodeURIComponent(p.user_id)}">
          💬 Chat Penjual
        </a>
      </div>
    `;

  muatKomentar(id);
}

function pasangGalleryScroll(jumlahFoto) {
  const scroll = document.getElementById('galleryScroll');

  if (jumlahFoto > 1) {
    const dots = document.querySelectorAll('#galleryDots span');
    scroll.addEventListener('scroll', () => {
      const index = Math.round(scroll.scrollLeft / scroll.clientWidth);
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    });
  }

  // Tap foto = buka versi full-screen (lightbox)
  scroll.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => bukaLightbox(img.src));
  });
}

function bukaLightbox(src) {
  const lb = document.createElement('div');
  lb.className = 'lightbox-overlay';
  lb.innerHTML = `
    <button class="lightbox-close" aria-label="Tutup">✕</button>
    <img src="${src}" alt="Foto barang diperbesar" />
  `;
  lb.addEventListener('click', () => lb.remove());
  document.body.appendChild(lb);
}

async function cekFavoritAktif(productId, userId) {
  const hasil = await apiGet('getFavorites', { user_id: userId });
  if (!Array.isArray(hasil)) return false;
  return hasil.some((p) => p.id === productId);
}

function pasangFavoritDetail(productId) {
  const btn = document.getElementById('favHeartDetail');
  btn.addEventListener('click', async () => {
    const user = await requireUser();
    if (!user) return;
    const aktif = btn.classList.contains('active');
    btn.classList.toggle('active');
    btn.classList.remove('beat');
    void btn.offsetWidth; // trik restart animasi
    btn.classList.add('beat');
    if (aktif) {
      await apiPost('removeFavorite', { user_id: user.user_id, product_id: productId });
    } else {
      await apiPost('addFavorite', { user_id: user.user_id, product_id: productId });
    }
  });
}

function pasangShareWa(p) {
  document.getElementById('btnShareWa').addEventListener('click', () => {
    const harga = Number(p.harga) === 0 ? 'GRATIS' : 'Rp' + Number(p.harga).toLocaleString('id-ID');
    const teks = `Cek barang ini di Dulur: *${p.nama_barang}* - ${harga}\n${window.location.href}`;
    window.open('https://wa.me/?text=' + encodeURIComponent(teks), '_blank');
  });
}

function pasangLaporkan(p) {
  document.getElementById('btnLaporkan').addEventListener('click', () => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box">
        <h3 style="margin-top:0;">🚩 Laporkan Barang</h3>
        <p style="font-size:0.85rem; color:var(--color-muted);">
          Kenapa Anda melaporkan "<strong>${p.nama_barang}</strong>"?
        </p>
        <div class="form-group">
          <select id="alasanLapor">
            <option>Barang terlarang / melanggar hukum</option>
            <option>Diduga penipuan</option>
            <option>Foto/deskripsi tidak sesuai</option>
            <option>Spam atau duplikat</option>
            <option>Lainnya</option>
          </select>
        </div>
        <div class="form-group">
          <textarea id="detailLapor" rows="3" placeholder="Ceritakan lebih detail (opsional)"></textarea>
        </div>
        <button class="btn btn-primary" id="btnKirimLapor" style="margin-bottom:8px;">Kirim Laporan</button>
        <button class="btn btn-secondary" id="btnBatalLapor">Batal</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btnBatalLapor').addEventListener('click', () => modal.remove());
    document.getElementById('btnKirimLapor').addEventListener('click', async () => {
      const user = await requireUser();
      if (!user) return;
      const alasan = document.getElementById('alasanLapor').value + ' — ' + document.getElementById('detailLapor').value;
      await apiPost('addReport', {
        jenis: 'barang',
        target_id: p.id,
        target_nama: p.nama_barang,
        pelapor_id: user.user_id,
        alasan,
      });
      modal.innerHTML = `
        <div class="modal-box" style="text-align:center;">
          <p style="font-size:2rem; margin:0;">✅</p>
          <p>Laporan terkirim. Terima kasih sudah menjaga komunitas Dulur.</p>
          <button class="btn btn-primary" id="btnTutupLapor">Tutup</button>
        </div>
      `;
      document.getElementById('btnTutupLapor').addEventListener('click', () => modal.remove());
    });
  });
}

async function muatKomentar(productId) {
  const section = document.getElementById('commentSection');
  section.innerHTML = `
    <p class="section-title">💬 Komentar Publik</p>
    <p style="font-size:0.8rem; color:var(--color-muted); margin-top:-6px; margin-bottom:12px;">
      Tanya-jawab terbuka soal barang ini — beda dari chat pribadi, bisa dilihat semua orang.
    </p>
    <div id="daftarKomentar"><p class="empty-state">Memuat komentar...</p></div>
    <div style="display:flex; gap:8px; margin-top:12px;">
      <input type="text" id="inputKomentar" class="search-box" style="margin-bottom:0;" placeholder="Tulis pertanyaan/komentar..." />
      <button id="btnKirimKomentar" class="btn btn-primary" style="width:auto; padding:0 18px; flex-shrink:0;">Kirim</button>
    </div>
  `;

  const komentarList = await apiGet('getComments', { productId });
  gambarKomentar(komentarList);

  document.getElementById('btnKirimKomentar').addEventListener('click', async () => {
    const input = document.getElementById('inputKomentar');
    const isi = input.value.trim();
    if (!isi) return;
    const user = await requireUser();
    if (!user) return;
    input.value = '';
    await apiPost('addComment', {
      product_id: productId,
      user_id: user.user_id,
      nama_pengirim: user.nama,
      isi_komentar: isi,
    });
    const updated = await apiGet('getComments', { productId });
    gambarKomentar(updated);
  });
}

function gambarKomentar(list) {
  const el = document.getElementById('daftarKomentar');
  if (!Array.isArray(list) || list.length === 0) {
    el.innerHTML = '<p class="empty-state" style="padding:20px 0;">Belum ada komentar. Jadilah yang pertama bertanya!</p>';
    return;
  }
  el.innerHTML = list.map((k) => `
    <div class="seller-card" style="margin-bottom:8px; align-items:flex-start;">
      <div class="seller-avatar" style="width:32px; height:32px; font-size:0.85rem; flex-shrink:0;">
        ${(k.nama_pengirim || '?').charAt(0).toUpperCase()}
      </div>
      <div style="flex:1;">
        <p style="margin:0; font-weight:700; font-size:0.85rem;">${k.nama_pengirim || 'Warga'}</p>
        <p style="margin:2px 0 0; font-size:0.87rem;">${k.isi_komentar}</p>
      </div>
    </div>
  `).join('');
}

muatDetail();
