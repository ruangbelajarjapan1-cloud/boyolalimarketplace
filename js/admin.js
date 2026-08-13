// ============================================================
// ADMIN.JS — logika untuk admin.html
// ============================================================

let adminPassword = sessionStorage.getItem('adminPassword') || '';
let semuaUsers = [];
let semuaProducts = [];

document.getElementById('btnMasukAdmin').addEventListener('click', async () => {
  adminPassword = document.getElementById('adminPassword').value;
  const cek = await apiGet('adminGetUsers', { password: adminPassword });

  if (cek.error) {
    tampilkanToast(cek.error, 'error');
    return;
  }

  sessionStorage.setItem('adminPassword', adminPassword);
  document.getElementById('loginGate').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  semuaUsers = cek;
  renderUsers(semuaUsers);
});

(async function cekSesiAdmin() {
  if (!adminPassword) return;
  const cek = await apiGet('adminGetUsers', { password: adminPassword });
  if (cek.error) return;
  document.getElementById('loginGate').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  semuaUsers = cek;
  renderUsers(semuaUsers);
})();

// --- Tab switching ---
const tabs = { tabUsers: 'panelUsers', tabProducts: 'panelProducts', tabIklanMasuk: 'panelIklanMasuk', tabAds: 'panelAds' };
Object.keys(tabs).forEach((tabId) => {
  document.getElementById(tabId).addEventListener('click', async () => {
    Object.keys(tabs).forEach((id) => {
      document.getElementById(id).classList.toggle('active', id === tabId);
      document.getElementById(tabs[id]).style.display = id === tabId ? 'block' : 'none';
    });
    if (tabId === 'tabUsers') {
      semuaUsers = await apiGet('adminGetUsers', { password: adminPassword });
      renderUsers(semuaUsers);
    }
    if (tabId === 'tabProducts') {
      semuaProducts = await apiGet('adminGetProducts', { password: adminPassword });
      renderProducts(semuaProducts);
    }
    if (tabId === 'tabIklanMasuk') {
      const iklan = await apiGet('adminGetAllAds', { password: adminPassword });
      renderIklanMasuk(iklan);
    }
  });
});

// --- Tab: Verifikasi User (dengan pencarian) ---
function renderUsers(users) {
  const el = document.getElementById('panelUsers');

  if (!Array.isArray(users) || users.length === 0) {
    el.innerHTML = '<p class="empty-state">Belum ada user.</p>';
    return;
  }

  el.innerHTML = `
    <input type="text" id="cariUser" class="search-box" placeholder="🔍 Cari nama atau no HP..." />
    <p style="font-size:0.8rem; color:var(--color-muted); margin-bottom:10px;">${users.length} user terdaftar</p>
    <div id="daftarUser"></div>
  `;

  gambarDaftarUser(users);

  document.getElementById('cariUser').addEventListener('input', (e) => {
    const kata = e.target.value.toLowerCase();
    const hasil = users.filter(
      (u) => u.nama.toLowerCase().includes(kata) || String(u.no_hp).includes(kata)
    );
    gambarDaftarUser(hasil);
  });
}

function gambarDaftarUser(users) {
  document.getElementById('daftarUser').innerHTML = users
    .map(
      (u) => `
    <div class="admin-row">
    <strong>${escapeHtml(u.nama)}</strong> — ${escapeHtml(u.no_hp)}<br>
      <small>${escapeHtml(u.lokasi_kecamatan) || ''}, ${escapeHtml(u.kabupaten) || ''}</small><br>
      Status: ${u.is_verified_ktp === true ? '✅ Terverifikasi' : '⏳ Belum'} |
      Toko: ${u.is_toko === true ? '🏪 Aktif sampai ' + formatTanggal(u.toko_sampai) : 'Tidak aktif'}
      <div class="aksi">
        <button onclick="ubahVerifikasi('${u.user_id}', true)">Verifikasi</button>
        <button onclick="ubahVerifikasi('${u.user_id}', false)">Batalkan</button>
    <button onclick="ubahToko('${u.user_id}', true)">🏪 Jadikan Toko (30 hari)</button>
        <button onclick="ubahToko('${u.user_id}', false)">Matikan Toko</button>
        <button onclick="resetPin('${u.user_id}', '${u.nama.replace(/'/g, "")}')" style="border-color:#c0392b; color:#c0392b;">🔑 Reset PIN</button>
      </div>
    </div>
  `
    )
    .join('');
}

async function ubahToko(user_id, aktif) {
  const result = await apiPost('adminSetToko', { password: adminPassword, user_id, aktif, hari: 30 });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('Status Toko diperbarui', 'success');
  semuaUsers = await apiGet('adminGetUsers', { password: adminPassword });
  renderUsers(semuaUsers);
}

async function resetPin(user_id, nama) {
  const yakin = await tampilkanKonfirmasi(
    `PIN akun "${nama}" akan dihapus. User itu harus bikin PIN baru lagi saat Masuk berikutnya (pastikan sudah verifikasi identitas via WhatsApp dulu sebelum reset).`,
    'Reset PIN?'
  );
  if (!yakin) return;

  const result = await apiPost('adminResetPin', { password: adminPassword, user_id });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('PIN berhasil direset', 'success');
}

// --- Tab: Listing Unggulan (dengan pencarian) ---
function renderProducts(products) {
  const el = document.getElementById('panelProducts');

  if (!Array.isArray(products) || products.length === 0) {
    el.innerHTML = '<p class="empty-state">Belum ada produk.</p>';
    return;
  }

  el.innerHTML = `
    <input type="text" id="cariProduk" class="search-box" placeholder="🔍 Cari nama barang atau penjual..." />
    <p style="font-size:0.8rem; color:var(--color-muted); margin-bottom:10px;">${products.length} barang total</p>
    <div id="daftarProduk"></div>
  `;

  gambarDaftarProduk(products);

  document.getElementById('cariProduk').addEventListener('input', (e) => {
    const kata = e.target.value.toLowerCase();
    const hasil = products.filter(
      (p) =>
        (p.nama_barang || '').toLowerCase().includes(kata) ||
        (p.penjual_nama || '').toLowerCase().includes(kata)
    );
    gambarDaftarProduk(hasil);
  });
}

function gambarDaftarProduk(products) {
  document.getElementById('daftarProduk').innerHTML = products
    .map(
      (p) => `
    <div class="admin-row">
    <strong>${escapeHtml(p.nama_barang)}</strong> — Rp${Number(p.harga || 0).toLocaleString('id-ID')}<br>
      <small>Penjual: ${escapeHtml(p.penjual_nama) || '-'} | Status: ${escapeHtml(p.status)}</small><br>
      Unggulan: ${p.unggulan === true ? '⭐ Aktif sampai ' + formatTanggal(p.unggulan_sampai) : 'Tidak aktif'}
      <div class="aksi">
        <button onclick="ubahUnggulan('${p.id}', true)">Jadikan Unggulan (7 hari)</button>
        <button onclick="ubahUnggulan('${p.id}', false)">Matikan</button>
        <button onclick="sundulProduk('${p.id}')">🚀 Sundul ke Atas</button>
        <button onclick="hapusProdukAdmin('${p.id}', '${p.nama_barang.replace(/'/g, "")}')" style="border-color:#c0392b; color:#c0392b;">🗑️ Hapus</button>
      </div>
    </div>
  `
    )
    .join('');
}

async function sundulProduk(product_id) {
  const result = await apiPost('adminSundul', { password: adminPassword, product_id });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('Berhasil disundul!', 'success');
  semuaProducts = await apiGet('adminGetProducts', { password: adminPassword });
  renderProducts(semuaProducts);
}
async function hapusProdukAdmin(product_id, namaBarang) {
  const yakin = await tampilkanKonfirmasi(`Barang "${namaBarang}" akan dihapus permanen dari database.`, 'Hapus Barang Ini?');
  if (!yakin) return;

  const result = await apiPost('adminDeleteProduct', { password: adminPassword, product_id });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('Barang berhasil dihapus', 'success');
  semuaProducts = await apiGet('adminGetProducts', { password: adminPassword });
  renderProducts(semuaProducts);
}
function formatTanggal(v) {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d) ? '-' : d.toLocaleDateString('id-ID');
}

async function ubahUnggulan(product_id, aktif) {
  const result = await apiPost('adminSetFeatured', { password: adminPassword, product_id, aktif, hari: 7 });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('Listing Unggulan diperbarui', 'success');
  semuaProducts = await apiGet('adminGetProducts', { password: adminPassword });
  renderProducts(semuaProducts);
}

// --- Tab: Tambah Iklan ---
document.getElementById('adForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const result = await apiPost('adminAddAd', {
    password: adminPassword,
    nama_pengiklan: document.getElementById('ad_nama').value,
    gambar_url: document.getElementById('ad_gambar').value,
    link_tujuan: document.getElementById('ad_link').value,
    tanggal_mulai: document.getElementById('ad_mulai').value,
    tanggal_selesai: document.getElementById('ad_selesai').value,
  });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('Iklan berhasil ditambahkan!', 'success');
  e.target.reset();
});
function renderIklanMasuk(daftar) {
  const el = document.getElementById('panelIklanMasuk');

  if (!Array.isArray(daftar) || daftar.length === 0) {
    el.innerHTML = '<p class="empty-state">Belum ada iklan masuk.</p>';
    return;
  }

  el.innerHTML = daftar
    .map(
      (i) => `
    <div class="admin-row">
      <img src="${i.gambar_url}" style="width:100%; border-radius:8px; margin-bottom:8px;" onerror="this.style.display='none'" />
      <strong>${escapeHtml(i.nama_pengiklan)}</strong><br>
      <small>WA: ${escapeHtml(i.kontak_pengiklan) || '-'} | Link: ${escapeHtml(i.link_tujuan) || '-'}</small><br>
      Status: ${
        i.status === 'disetujui'
          ? '✅ Disetujui, tayang sampai ' + formatTanggal(i.tanggal_selesai)
          : i.status === 'ditolak'
          ? '❌ Ditolak'
          : '⏳ Menunggu persetujuan'
      }
      <div class="aksi">
        ${i.status !== 'disetujui' ? `<button onclick="setujuiIklan('${i.id}')">✅ Setujui (30 hari)</button>` : ''}
        ${i.status !== 'ditolak' ? `<button onclick="tolakIklan('${i.id}')">❌ Tolak</button>` : ''}
      </div>
    </div>
  `
    )
    .join('');
}

async function setujuiIklan(iklan_id) {
  const result = await apiPost('adminSetujuiIklan', { password: adminPassword, iklan_id, hari: 30 });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('Iklan disetujui dan mulai tayang', 'success');
  const iklan = await apiGet('adminGetAllAds', { password: adminPassword });
  renderIklanMasuk(iklan);
}

async function tolakIklan(iklan_id) {
  const result = await apiPost('adminTolakIklan', { password: adminPassword, iklan_id });
  if (result.error) return tampilkanToast(result.error, 'error');
  tampilkanToast('Iklan ditolak', 'success');
  const iklan = await apiGet('adminGetAllAds', { password: adminPassword });
  renderIklanMasuk(iklan);
}
