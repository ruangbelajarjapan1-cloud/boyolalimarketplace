// ============================================================
// SETUP-CHECK.JS — Tampilkan peringatan JELAS di layar (bukan cuma
// di Console) kalau config.js belum diisi. Sertakan file ini di
// SEMUA halaman, taruh setelah config.js.
// ============================================================

(function () {
  if (isConfigured()) return;

  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: #b3261e; color: white; padding: 12px 16px;
    font-family: sans-serif; font-size: 0.85rem; text-align: center;
  `;
  banner.innerHTML =
    '⚠️ Backend belum disambungkan. Buka <code>js/config.js</code>, ' +
    'isi <code>SUPABASE_URL</code> dan <code>SUPABASE_ANON_KEY</code> Anda.';
  document.body.prepend(banner);
  document.body.style.paddingTop = '50px';
})();
