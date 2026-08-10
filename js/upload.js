// ============================================================
// UPLOAD.JS — logika untuk upload.html (sampai 3 foto)
// ============================================================

const fotoTerupload = { 1: '', 2: '', 3: '' };

[1, 2, 3].forEach((slot) => {
  document.getElementById(`foto_file_${slot}`).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const status = document.getElementById(`uploadStatus${slot}`);
    const preview = document.getElementById(`fotoPreview${slot}`);
    status.textContent = 'Mengompres foto...';

    try {
      const base64 = await kompresFotoKeBase64(file);
      preview.src = 'data:image/jpeg;base64,' + base64;
      preview.style.display = 'block';

      status.textContent = 'Mengupload foto...';
      const result = await apiPost('uploadImage', {
        base64,
        mimeType: 'image/jpeg',
        filename: `barang-${Date.now()}-${slot}.jpg`,
      });

      if (result.error) {
        status.textContent = '⚠️ ' + result.error;
        return;
      }

      fotoTerupload[slot] = result.url;
      status.textContent = '✅ Foto berhasil diupload';
    } catch (err) {
      status.textContent = '⚠️ Gagal memproses foto. Coba foto lain.';
    }
  });
});

function kompresFotoKeBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 1000;
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = await requireUser();
  if (!user) return;

  const linkManual = document.getElementById('foto_url').value;

  const data = {
    user_id: user.user_id,
    nama_barang: document.getElementById('nama_barang').value,
    kategori: document.getElementById('kategori').value,
    harga: document.getElementById('harga').value,
    deskripsi: document.getElementById('deskripsi').value,
    foto_url: fotoTerupload[1] || linkManual,
    foto_url_2: fotoTerupload[2] || '',
    foto_url_3: fotoTerupload[3] || '',
    lokasi: document.getElementById('lokasi').value || user.lokasi_kecamatan,
    kabupaten: document.getElementById('kabupaten').value || user.kabupaten,
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Mengunggah...';

  const result = await apiPost('addProduct', data);

  if (result.success) {
    alert('Barang berhasil diposting!');
    window.location.href = `produk.html?id=${result.product_id}`;
  } else {
    alert(result.error || 'Gagal upload. Coba lagi.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Posting Barang';
  }
});
