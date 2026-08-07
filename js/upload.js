// ============================================================
// UPLOAD.JS — logika untuk upload.html
// ============================================================

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = await requireUser();
  if (!user) return;

  const data = {
    user_id: user.user_id,
    nama_barang: document.getElementById('nama_barang').value,
    kategori: document.getElementById('kategori').value,
    harga: document.getElementById('harga').value,
    deskripsi: document.getElementById('deskripsi').value,
    foto_url: document.getElementById('foto_url').value,
    lokasi: document.getElementById('lokasi').value || user.lokasi_kecamatan,
    kabupaten: document.getElementById('kabupaten').value || user.kabupaten,
  };

  const submitBtn = e.target.querySelector('button');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Mengunggah...';

  const result = await apiPost('addProduct', data);

  if (result.success) {
    alert('Barang berhasil diposting!');
    window.location.href = `produk.html?id=${result.product_id}`;
  } else {
    alert('Gagal upload. Coba lagi.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Posting Barang';
  }
});
