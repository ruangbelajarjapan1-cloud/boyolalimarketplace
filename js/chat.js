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
  pollingInterval = setInterval(muatPesan, 3000);
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
      return `<div class="bubble ${punyaSaya ? 'mine' : 'theirs'}">${p.isi_pesan}</div>`;
    })
    .join('');

  chatWindow.scrollTop = chatWindow.scrollHeight;
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
