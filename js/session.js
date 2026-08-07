// ============================================================
// SESSION.JS — Identitas pengguna untuk tahap MVP.
//
// Ini BUKAN sistem login yang aman (belum ada password). Cukup
// untuk tahap uji coba ke teman/kenalan dulu. Nanti saat pindah
// ke Supabase, ini diganti Supabase Auth yang aman sungguhan.
// ============================================================

function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('currentUser');
}

// Panggil ini di halaman yang WAJIB login (Upload, Chat).
// Kalau belum ada identitas, arahkan ke halaman Daftar dan otomatis
// kembali ke halaman ini setelah selesai daftar.
async function requireUser() {
  const user = getCurrentUser();
  if (user) return user;

  const halamanSekarang = window.location.pathname.split('/').pop() + window.location.search;
  window.location.href = 'daftar.html?redirect=' + encodeURIComponent(halamanSekarang);
  return null;
}
