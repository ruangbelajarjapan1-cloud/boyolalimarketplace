// ============================================================
// CHAT-LIST.JS — logika untuk chat-list.html
// ============================================================
let userChatList = null;

let sudahPernahMuatChat = false;

async function muatDaftarChat() {
  userChatList = await requireUser();
  if (!userChatList) return;

  const el = document.getElementById('daftarChat');
  if (!sudahPernahMuatChat) el.innerHTML = skeletonRowsChat(4);

  const hasil = await apiGet('getChatList', { user_id: userChatList.user_id });
  sudahPernahMuatChat = true;

  if (hasil && hasil.error) {
    el.innerHTML = `<p class="empty-state">⚠️ ${hasil.error}</p>`;
    return;
  }

  if (!Array.isArray(hasil) || hasil.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <p>Belum ada percakapan.<br>Chat penjual dari halaman Detail Barang untuk mulai.</p>
        <a href="index.html" class="btn btn-primary" style="max-width:220px; margin:12px auto 0;">Jelajah Barang</a>
      </div>
    `;
    return;
  }

  el.innerHTML = hasil.map(chatKeBaris).join('');
}

function chatKeBaris(c) {
  const fotoUrl = c.produk_foto || 'img/placeholder.svg';
  const prefix = c.pengirim_terakhir_saya ? 'Anda: ' : '';
  const waktu = formatWaktuRelatif(c.waktu);

  return `
    <a class="chat-row" href="chat.html?productId=${encodeURIComponent(c.product_id)}&penjual=${encodeURIComponent(c.lawan_id)}">
      <img src="${fotoUrl}" loading="lazy" onerror="this.src='img/placeholder.svg'" />
      <div class="info">
      <p class="lawan">${escapeHtml(c.lawan_nama)}</p>
        <p class="produk">${escapeHtml(c.produk_nama)}</p>
        <p class="pesan">${prefix}${escapeHtml(c.pesan_terakhir)}</p>
      </div>
      <span class="waktu">${waktu}</span>
    </a>
  `;
}

function skeletonRowsChat(jumlah) {
  return Array(jumlah).fill(0).map(() => `
    <div class="skeleton-row">
      <div class="skeleton-block avatar"></div>
      <div style="flex:1;">
        <div class="skeleton-block text" style="margin-bottom:8px;"></div>
        <div class="skeleton-block text short"></div>
      </div>
    </div>
  `).join('');
}

function formatWaktuRelatif(waktuStr) {
  const waktu = new Date(waktuStr);
  const now = new Date();
  const selisihMenit = Math.floor((now - waktu) / 60000);

  if (selisihMenit < 1) return 'Baru saja';
  if (selisihMenit < 60) return `${selisihMenit}m`;
  if (selisihMenit < 1440) return `${Math.floor(selisihMenit / 60)}j`;
  if (selisihMenit < 10080) return `${Math.floor(selisihMenit / 1440)}h`;
  return waktu.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

muatDaftarChat();

let pollingChatList = setInterval(muatDaftarChat, 4000);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(pollingChatList);
  } else {
    muatDaftarChat();
    pollingChatList = setInterval(muatDaftarChat, 4000);
  }
});
