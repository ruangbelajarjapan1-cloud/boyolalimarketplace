// ============================================================
// CHAT.JS — logika untuk chat.html
//
// Catatan: ini pakai "polling" (cek pesan baru tiap 3 detik),
// BUKAN realtime asli. Cukup untuk tahap MVP/Spreadsheet.
// Setelah pindah ke Supabase, ganti dengan Supabase Realtime
// supaya pesan muncul instan tanpa jeda.
// ============================================================

let currentUserId = null;
let lawanBicaraId = null;
let productId = null;
let pollingInterval = null;
const JEDA_POLLING_MS = 2500;

async function mulaiChat() {
  const params = new URLSearchParams(window.location.search);
  productId = params.get('productId');
  lawanBicaraId = params.get('penjual');

  const user = await requireUser();
  if (!user) return;
  currentUserId = user.user_id;

  // Kalau yang buka chat adalah penjualnya sendiri, jangan chat ke diri sendiri
  if (currentUserId === lawanBicaraId) {
    document.getElementById('chatWindow').innerHTML =
      '<p class="empty-state">Ini barang Anda sendiri.</p>';
    return;
  }

  await muatPesan();
  jalankanPolling();

  // Hemat kuota: berhenti polling kalau tab/app tidak aktif dilihat,
  // langsung jalan lagi begitu balik dibuka
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(pollingInterval);
    } else {
      muatPesan();
      jalankanPolling();
    }
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

  if (!Array.isArray(pesanList) || pesanList.length === 0) {
    chatWindow.innerHTML = '<p class="empty-state">Belum ada pesan. Mulai chat!</p>';
    return;
  }

  chatWindow.innerHTML = pesanList
    .map((p) => {
      const punyaSaya = p.pengirim_id === currentUserId;
      const centang = punyaSaya
        ? `<span class="centang ${p.dibaca === true ? 'dibaca' : ''}">${p.dibaca === true ? '✓✓' : '✓'}</span>`
        : '';
      return `<div class="bubble ${punyaSaya ? 'mine' : 'theirs'}">${p.isi_pesan}${centang}</div>`;
    })
    .join('');

  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Tandai pesan dari lawan bicara sebagai sudah dibaca, karena kita
  // sedang aktif melihat percakapan ini
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

  await apiPost('sendMessage', {
    terkait_id: productId,
    pengirim_id: currentUserId,
    penerima_id: lawanBicaraId,
    isi_pesan: isi,
  });

  await muatPesan();
}

mulaiChat();
