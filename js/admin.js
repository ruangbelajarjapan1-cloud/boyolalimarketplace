// ============================================================
// ADMIN.JS — logika untuk admin.html
// ============================================================

let adminPassword = sessionStorage.getItem('adminPassword') || '';

document.getElementById('btnMasukAdmin').addEventListener('click', async () => {
  adminPassword = document.getElementById('adminPassword').value;
  const cek = await apiGet('adminGetUsers', { password: adminPassword });

  if (cek.error) {
    alert(cek.error);
    return;
  }

  sessionStorage.setItem('adminPassword', adminPassword);
  document.getElementById('loginGate').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  renderUsers(cek);
});

// Kalau password sudah tersimpan dari sesi sebelumnya, langsung masuk
(async function cekSesiAdmin() {
  if (!adminPassword) return;
  const cek = await apiGet('adminGetUsers', { password: adminPassword });
  if (cek.error) return;
  document.getElementById('loginGate').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  renderUsers(cek);
})();

// --- Tab switching ---
const tabs = { tabUsers: 'panelUsers', tabProducts: 'panelProducts', tabAds: 'panelAds' };
Object.keys(tabs).forEach((tabId) => {
  document.getElementById(tabId).addEventListener('click', async () => {
    Object.keys(tabs).forEach((id) => {
      document.getElementById(id).classList.toggle('active', id === tabId);
      document.getElementById(tabs[id]).style.display = id === tabId ? 'block' : 'none';
    });
    if (tabId === 'tabUsers') renderUsers(await apiGet('adminGetUsers', { password: adminPassword }));
    if (tabId === 'tabProducts') renderProducts(await apiGet('adminGetProducts', { password: adminPassword }));
  });
});

// --- Tab: Verifikasi User ---
function renderUsers(users) {
  const el = document.getElementById('panelUsers');
  if (!Array.isArray(users) || users.length === 0) {
    el.innerHTML = '<p class="empty-state">Belum ada user.</p>';
    return;
  }
  el.innerHTML = users
    .map(
      (u) => `
    <div class="admin-row">
      <strong>${u.nama}</strong> — ${u.no_hp}<br>
      <small>${u.lokasi_kecamatan || ''}, ${u.kabupaten || ''}</small><br>
      Status: ${u.is_verified_ktp === true ? '✅ Terverifikasi' : '⏳ Belum'}
      <div class="aksi">
        <button onclick="ubahVerifikasi('${u.user_id}', true)">Verifikasi</button>
        <button onclick="ubahVerifikasi('${u.user_id}', false)">Batalkan</button>
      </div>
    </div>
  `
    )
    .join('');
}

async function ubahVerifikasi(user_id, verified) {
  const result = await apiPost('adminSetVerified', { password: adminPassword, user_id, verified });
  if (result.error) return alert(result.error);
  renderUsers(await apiGet('adminGetUsers', { password: adminPassword }));
}

// --- Tab: Listing Unggulan ---
function renderProducts(products) {
  const el = document.getElementById('panelProducts');
  if (!Array.isArray(products) || products.length === 0) {
    el.innerHTML = '<p class="empty-state">Belum ada produk.</p>';
    return;
  }
  el.innerHTML = products
    .map(
      (p) => `
    <div class="admin-row">
      <strong>${p.nama_barang}</strong> — Rp${Number(p.harga || 0).toLocaleString('id-ID')}<br>
      <small>Penjual: ${p.penjual_nama || '-'} | Status: ${p.status}</small><br>
      Unggulan: ${p.unggulan === true ? '⭐ Aktif sampai ' + formatTanggal(p.unggulan_sampai) : 'Tidak aktif'}
      <div class="aksi">
        <button onclick="ubahUnggulan('${p.product_id}', true)">Jadikan Unggulan (7 hari)</button>
        <button onclick="ubahUnggulan('${p.product_id}', false)">Matikan</button>
      </div>
    </div>
  `
    )
    .join('');
}

function formatTanggal(v) {
  if (!v) return '-';
  const d = new Date(v);
  return isNaN(d) ? '-' : d.toLocaleDateString('id-ID');
}

async function ubahUnggulan(product_id, aktif) {
  const result = await apiPost('adminSetFeatured', { password: adminPassword, product_id, aktif, hari: 7 });
  if (result.error) return alert(result.error);
  renderProducts(await apiGet('adminGetProducts', { password: adminPassword }));
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
  if (result.error) return alert(result.error);
  alert('Iklan berhasil ditambahkan!');
  e.target.reset();
});
