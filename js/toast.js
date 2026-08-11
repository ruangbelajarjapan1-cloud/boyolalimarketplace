// ============================================================
// TOAST.JS — notifikasi & konfirmasi gaya app, pengganti
// alert()/confirm() bawaan browser yang kaku. Sertakan file ini
// di halaman yang butuh, sebelum file JS halaman itu sendiri.
// ============================================================

function tampilkanToast(pesan, tipe) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast' + (tipe ? ' ' + tipe : '');
  const ikon = tipe === 'success' ? '✅' : tipe === 'error' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${ikon}</span><span>${pesan}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

// Pakai: const oke = await tampilkanKonfirmasi('Yakin mau hapus?');
function tampilkanKonfirmasi(pesan, judul) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box" style="text-align:center;">
        <h3 style="margin-top:0;">${judul || 'Konfirmasi'}</h3>
        <p style="font-size:0.9rem; color:var(--color-muted);">${pesan}</p>
        <button class="btn btn-primary" id="btnKonfirmasiYa" style="margin-bottom:8px; background:#c0392b; box-shadow:none;">Ya, Lanjutkan</button>
        <button class="btn btn-secondary" id="btnKonfirmasiTidak">Batal</button>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#btnKonfirmasiYa').addEventListener('click', () => {
      modal.remove();
      resolve(true);
    });
    modal.querySelector('#btnKonfirmasiTidak').addEventListener('click', () => {
      modal.remove();
      resolve(false);
    });
  });
}
