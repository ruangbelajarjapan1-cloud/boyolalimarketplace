// ============================================================
// CHAT-NOTIF.JS — notifikasi ringan untuk pesan chat baru.
// Cuma jalan selama app/tab masih terbuka (bukan push sungguhan).
// Sertakan di halaman yang sering dibuka lama (Home, Chat List).
// ============================================================

const JEDA_CEK_NOTIF_MS = 15000;

function notifikasiAktif() {
  return (
    'Notification' in window &&
    localStorage.getItem('notifChatAktif') === '1' &&
    Notification.permission === 'granted'
  );
}

async function mintaIzinNotifikasi() {
  if (!('Notification' in window)) {
    tampilkanToast('Browser/HP Anda tidak mendukung notifikasi.', 'error');
    return false;
  }

  if (Notification.permission === 'granted') {
    localStorage.setItem('notifChatAktif', '1');
    tampilkanToast('Notifikasi chat diaktifkan!', 'success');
    return true;
  }

  if (Notification.permission === 'denied') {
    tampilkanToast('Izin notifikasi diblokir. Aktifkan manual lewat setting browser Anda.', 'error');
    return false;
  }

  const hasil = await Notification.requestPermission();
  if (hasil === 'granted') {
    localStorage.setItem('notifChatAktif', '1');
    tampilkanToast('Notifikasi chat diaktifkan!', 'success');
    return true;
  }

  tampilkanToast('Izin notifikasi ditolak.', 'error');
  return false;
}

function matikanNotifikasiChat() {
  localStorage.setItem('notifChatAktif', '0');
  tampilkanToast('Notifikasi chat dimatikan.', 'success');
}

// ------------------------------------------------------------
// Cek berkala apakah ada pesan baru dari lawan bicara
// ------------------------------------------------------------
async function cekPesanBaruUntukNotifikasi() {
  if (!notifikasiAktif()) return;
  const user = getCurrentUser();
  if (!user) return;

  const hasil = await apiGet('getChatList', { user_id: user.user_id });
  if (!Array.isArray(hasil)) return;

  const terakhirDilihat = Number(localStorage.getItem('notifTerakhirWaktu') || 0);
  let waktuTerbaru = terakhirDilihat;

  hasil.forEach((c) => {
    const waktuPesan = new Date(c.waktu).getTime();
    if (!c.pengirim_terakhir_saya && waktuPesan > terakhirDilihat) {
      tampilkanNotifikasiChat(c);
    }
    if (waktuPesan > waktuTerbaru) waktuTerbaru = waktuPesan;
  });

  localStorage.setItem('notifTerakhirWaktu', String(waktuTerbaru));
}

function tampilkanNotifikasiChat(c) {
  const notif = new Notification(`💬 ${c.lawan_nama}`, {
    body: c.pesan_terakhir,
    icon: 'icon-192.png',
    tag: c.product_id + '-' + c.lawan_id, // biar notif lama untuk chat yg sama tidak numpuk
  });

  notif.onclick = () => {
    window.focus();
    window.location.href = `chat.html?productId=${encodeURIComponent(c.product_id)}&penjual=${encodeURIComponent(c.lawan_id)}`;
  };
}

// Set baseline waktu pertama kali notifikasi diaktifkan, supaya tidak
// langsung "banjir" notif dari histori chat lama begitu dinyalakan
(async function initBaselineNotif() {
  if (localStorage.getItem('notifTerakhirWaktu')) return;
  const user = getCurrentUser();
  if (!user) return;

  const hasil = await apiGet('getChatList', { user_id: user.user_id });
  if (!Array.isArray(hasil) || hasil.length === 0) return;

  const waktuMax = Math.max(...hasil.map((c) => new Date(c.waktu).getTime()));
  localStorage.setItem('notifTerakhirWaktu', String(waktuMax));
})();

setInterval(cekPesanBaruUntukNotifikasi, JEDA_CEK_NOTIF_MS);

// Cek juga begitu user balik buka tab-nya (habis pindah app/tab lain)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) cekPesanBaruUntukNotifikasi();
});
