// ============================================================
// CHAT.JS — logika untuk chat.html
// ============================================================

let currentUserId = null;
let lawanBicaraId = null;
let productId = null;
let pollingInterval = null;
const JEDA_POLLING_MS = 2500;

const KATA_RAWAN_PENIPUAN = [
  'transfer dulu', 'transfer duluan', 'dp dulu', 'kirim dulu',
  'bayar dulu', 'ongkir dulu', 'kirim ongkir', 'uang muka', 'panjar',
];

async function mulaiChat() {
  const params = new URLSearchParams(window.location.search);
  productId = params.get('productId');
  lawanBicaraId = params.get('penjual');

  const user = await requireUser();
  if (!user) return;
  currentUserId = user.user_id;

  if (currentUserId === lawanBicaraId) {
    document.getElementById('chatWindow').innerHTML =
      '<p class="empty-state">Ini barang Anda sendiri.</p>';
    return;
  }

  tampilkanTipsAmanJikaPerlu();

  await muatPesan();
  jalankanPolling();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(pollingInterval);
    } else {
      muatPesan();
      jalankanPolling();
    }
  });
}

// ------------------------------------------------------------
// TIPS AMAN BERTRANSAKSI — cuma muncul sekali seumur hidup app
// ------------------------------------------------------------
function tampilkanTipsAmanJikaPerlu() {
  if (localStorage.getItem('tipsAmanSudahLihat')) return;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <div class="onb-slide">
        <div class="onb-icon">💡</div>
        <h3>Tips Aman Bertransaksi</h3>
      </div>
      <ul style="font-size:0.87rem; line-height:1.9; color:var(--color-ink); padding-left:20px; margin:12px 0;">
        <li>Selalu ketemu di tempat umum yang ramai.</li>
        <li>Cek kondisi barang langsung sebelum bayar.</li>
        <li>Waspada kalau diminta transfer/DP sebelum ketemu.</li>
        <li>Untuk barang mahal, ajak teman/keluarga ikut.</li>
      </ul>
      <button class="btn btn-primary" id="btnTutupTipsAman">Mengerti</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('btnTutupTipsAman').addEventListener('click', () => {
    localStorage.setItem('tipsAmanSudahLihat', '1');
    modal.remove();
  });
}

// ------------------------------------------------------------
// DETEKSI KATA RAWAN PENIPUAN — cek pesan dari lawan bicara
// ------------------------------------------------------------
function cekKataRawanPenipuan(pesanList) {
  return pesanList.some((p) => {
    if (p.pengirim_id === currentUserId) return false; // cuma cek pesan LAWAN bicara
    const teks = String(p.isi_pesan).toLowerCase();
    return KATA_RAWAN_PENIPUAN.some((kata) => teks.includes(kata));
  });
}

function jalankanPolling() {
  clearInterval(pollingInterval);
  pollingInterval = setInterval(muatPesan, JEDA_POLLING_MS);
}

async function muatPesan() {
  const pesanList = await apiGet('getMessages', {
    productId,
    userA: currentUserId,
    userB: lawanBicaraId,
  });

  const chatWindow = document.getElementById('chatWindow');
  const peringatan = document.getElementById('peringatanRawan');

  if (!Array.isArray(pesanList) || pesanList.length === 0) {
    chatWindow.innerHTML = '<p class="empty-state">Belum ada pesan. Mulai chat!</p>';
    if (peringatan) peringatan.style.display = 'none';
    return;
  }

  if (peringatan) {
    peringatan.style.display = cekKataRawanPenipuan(pesanList) ? 'block' : 'none';
  }

  chatWindow.innerHTML = pesanList
    .map((p) => {
      const punyaSaya = p.pengirim_id === currentUserId;
      const centang = punyaSaya
        ? `<span class="centang ${p.dibaca === true ? 'dibaca' : ''}">${p.dibaca === true ? '✓✓' : '✓'}</span>`
        : '';
   return `<div class="bubble ${punyaSaya ? 'mine' : 'theirs'}">${escapeHtml(p.isi_pesan)}${centang}</div>`;
    })
    .join('');

  chatWindow.scrollTop = chatWindow.scrollHeight;

  apiPost('markMessagesRead', {
    terkait_id: productId,
    user_id: currentUserId,
    lawan_id: lawanBicaraId,
  });
}

document.getElementById('sendBtn').addEventListener('click', kirimPesan);
document.getElementById('messageInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') kirimPesan();
});

async function kirimPesan() {
  const input = document.getElementById('messageInput');
  const isi = input.value.trim();
  if (!isi) return;

  input.value = '';

  const result = await apiPost('sendMessage', {
    terkait_id: productId,
    pengirim_id: currentUserId,
    penerima_id: lawanBicaraId,
    isi_pesan: isi,
  });

  if (result.error) {
    tampilkanToast(result.error, 'error');
    input.value = isi; // kembalikan teksnya biar tidak hilang
    return;
  }

  await muatPesan();
}

mulaiChat();
