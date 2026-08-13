// ============================================================
// PASANG-IKLAN.JS — logika untuk pasang-iklan.html
// Form publik, TIDAK perlu login — siapa saja (toko/UMKM) bisa
// daftar iklan sendiri, tayang setelah dikonfirmasi Admin.
// ============================================================

document.getElementById('infoHarga').innerHTML = `
  💰 Paket iklan: <strong>Rp${HARGA_IKLAN_BULANAN.toLocaleString('id-ID')}</strong>
  untuk tayang <strong>${DURASI_IKLAN_HARI} hari</strong> di halaman utama.
`;

let fotoTerupload = '';

document.getElementById('foto_file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const status = document.getElementById('uploadStatus');
  const preview = document.getElementById('fotoPreview');
  status.textContent = 'Mengompres foto...';
  try {
    const base64 = await kompresFotoKeBase64(file);
    preview.src = 'data:image/jpeg;base64,' + base64;
    preview.style.display = 'block';
    status.textContent = 'Mengupload foto...';
    const result = await apiPost('uploadImage', {
      base64,
      mimeType: 'image/jpeg',
      filename: `iklan-${Date.now()}.jpg`,
    });
    if (result.error) {
      status.textContent = '⚠️ ' + result.error;
      return;
    }
    fotoTerupload = result.url;
    status.textContent = '✅ Foto berhasil diupload';
    perbaruiPratinjau();
  } catch (err) {
    status.textContent = '⚠️ Gagal memproses foto. Coba foto lain.';
  }
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
function perbaruiPratinjau() {
  const nama = document.getElementById('nama_pengiklan').value || 'Nama Usaha Anda';
  const gambar = fotoTerupload || document.getElementById('foto_url_manual').value;
  const preview = document.getElementById('previewBanner');

  if (!gambar) {
    preview.innerHTML = 'Isi nama usaha & foto dulu untuk lihat pratinjau';
    return;
  }

  preview.innerHTML = `
    <div class="ads-banner" style="position:relative; width:100%; border-radius:var(--radius-lg); overflow:hidden;">
      <img src="${gambar}" alt="${nama}" style="width:100%; display:block;" onerror="this.style.display='none'" />
      <span class="ads-label">Iklan</span>
    </div>
  `;
}

document.getElementById('nama_pengiklan').addEventListener('input', perbaruiPratinjau);
document.getElementById('foto_url_manual').addEventListener('input', perbaruiPratinjau);
document.getElementById('iklanForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const linkManual = document.getElementById('foto_url_manual').value;
  const gambarUrl = fotoTerupload || linkManual;

  if (!gambarUrl) {
    tampilkanToast('Foto/banner iklan wajib diisi — upload foto atau tempel link.', 'error');
    return;
  }

  const namaPengiklan = document.getElementById('nama_pengiklan').value;
  const kontak = document.getElementById('kontak_pengiklan').value.trim();

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Mendaftarkan...';

  const result = await apiPost('daftarIklan', {
    nama_pengiklan: namaPengiklan,
    gambar_url: gambarUrl,
    link_tujuan: document.getElementById('link_tujuan').value,
    kontak_pengiklan: kontak,
  });

  if (result.error) {
    tampilkanToast(result.error, 'error');
    btn.disabled = false;
    btn.textContent = 'Daftar Iklan';
    return;
  }

  tampilkanToast('Pendaftaran berhasil! Mengarahkan ke WhatsApp...', 'success');

  const hargaFormat = HARGA_IKLAN_BULANAN.toLocaleString('id-ID');
  const pesanWa = encodeURIComponent(
    `Halo, saya baru daftar iklan untuk usaha "${namaPengiklan}" di Dulur. Mau konfirmasi pembayaran Rp${hargaFormat} untuk ${DURASI_IKLAN_HARI} hari tayang. Ini bukti transfernya:`
  );

  setTimeout(() => {
    window.location.href = `https://wa.me/${NOMOR_WA_ADMIN}?text=${pesanWa}`;
  }, 1200);
});
