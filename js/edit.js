// ============================================================
// EDIT.JS — logika untuk edit.html
// ============================================================

let productIdEdit = '';
let fotoBaruTerupload = ''; // kosong = tidak ganti foto, pakai foto lama

async function muatFormEdit() {
  const params = new URLSearchParams(window.location.search);
  productIdEdit = params.get('id');
  const area = document.getElementById('formArea');

  const user = await requireUser();
  if (!user) return;

  const p = await apiGet('getProduct', { id: productIdEdit });

  if (p.error) {
    area.innerHTML = `<p class="empty-state">⚠️ ${p.error}</p>`;
    return;
  }

  if (p.user_id !== user.user_id) {
    area.innerHTML = `<p class="empty-state">Anda tidak berhak mengedit barang ini.</p>`;
    return;
  }

  area.innerHTML = `
    <div class="form-group">
      <label>Foto Saat Ini</label>
      <img src="${p.foto_url || 'img/placeholder.svg'}" style="width:100%; border-radius:var(--radius-md); aspect-ratio:1/1; object-fit:cover;" onerror="this.src='img/placeholder.svg'"/>
    </div>

    <div class="form-group">
      <label>Ganti Foto (opsional, biarkan kosong kalau tidak ganti)</label>
      <input type="file" id="foto_file" accept="image/*" capture="environment" />
      <p id="uploadStatus" style="font-size:0.8rem; color: var(--color-muted); margin-top:6px;"></p>
    </div>

    <div class="form-group">
      <label>Nama Barang</label>
      <input type="text" id="nama_barang" value="${escapeHtml(p.nama_barang)}" required />
    </div>

    <div class="form-group">
      <label>Kategori</label>
      <select id="kategori" required>
        ${['Kendaraan','Elektronik','Baju','Perabot','Pertanian','Donasi','Lainnya']
          .map((k) => `<option ${k === p.kategori ? 'selected' : ''}>${k}</option>`)
          .join('')}
      </select>
    </div>

    <div class="form-group" style="display:flex; align-items:center; gap:8px;">
      <input type="checkbox" id="butuh_cepat" ${p.butuh_cepat === true ? 'checked' : ''} style="width:18px; height:18px; flex-shrink:0;" />
      <label for="butuh_cepat" style="font-weight:400; font-size:0.85rem; margin:0;">
        🔴 Tandai "Butuh Cepat" (jual mendesak)
      </label>
    </div>

    <div class="form-group">
      <label>Harga (Rp)</label>
      <input type="number" id="harga" value="${p.harga}" required min="0" />
    </div>

    <div class="form-group">
      <label>Deskripsi</label>
      <textarea id="deskripsi" rows="4">${escapeHtml(p.deskripsi || '')}</textarea>
    </div>

    <div class="form-group">
      <label>Kecamatan</label>
      <input type="text" id="lokasi" value="${escapeHtml(p.lokasi || '')}" required />
    </div>

    <div class="form-group">
      <label>Kabupaten/Kota</label>
      <select id="kabupaten" required>
        ${['Boyolali','Surakarta (Solo)','Sukoharjo','Karanganyar','Sragen','Klaten','Semarang','Salatiga','Wonogiri']
          .map((k) => `<option ${k === p.kabupaten ? 'selected' : ''}>${k}</option>`)
          .join('')}
      </select>
    </div>

    <button id="btnSimpan" class="btn btn-primary">Simpan Perubahan</button>
  `;

  document.getElementById('foto_file').addEventListener('change', prosesFotoBaru);
  document.getElementById('btnSimpan').addEventListener('click', simpanPerubahan);
}

async function prosesFotoBaru(e) {
  const file = e.target.files[0];
  if (!file) return;
  const status = document.getElementById('uploadStatus');
  status.textContent = 'Mengompres & mengupload foto baru...';

  try {
    const base64 = await kompresFotoKeBase64(file);
    const result = await apiPost('uploadImage', {
      base64,
      mimeType: 'image/jpeg',
      filename: 'barang-' + Date.now() + '.jpg',
    });
    if (result.error) {
      status.textContent = '⚠️ ' + result.error;
      return;
    }
    fotoBaruTerupload = result.url;
    status.textContent = '✅ Foto baru siap disimpan';
  } catch (err) {
    status.textContent = '⚠️ Gagal memproses foto.';
  }
}

// Sama seperti di upload.js — kecilkan foto sebelum diupload
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

async function simpanPerubahan() {
  const user = getCurrentUser();
  const btn = document.getElementById('btnSimpan');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  const data = {
    product_id: productIdEdit,
    user_id: user.user_id,
    nama_barang: document.getElementById('nama_barang').value,
    kategori: document.getElementById('kategori').value,
    harga: document.getElementById('harga').value,
    deskripsi: document.getElementById('deskripsi').value,
    lokasi: document.getElementById('lokasi').value,
    kabupaten: document.getElementById('kabupaten').value,
    butuh_cepat: document.getElementById('butuh_cepat').checked,
  };
  if (fotoBaruTerupload) data.foto_url = fotoBaruTerupload;

  const result = await apiPost('updateProduct', data);

  if (result.success) {
    tampilkanToast('Perubahan disimpan!', 'success');
    setTimeout(() => {
      window.location.href = `produk.html?id=${productIdEdit}`;
    }, 900);
  } else {
    tampilkanToast(result.error || 'Gagal menyimpan.', 'error');
    btn.disabled = false;
    btn.textContent = 'Simpan Perubahan';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

muatFormEdit();
