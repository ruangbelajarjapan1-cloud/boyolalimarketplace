// ============================================================
// PULL-TO-REFRESH.JS — geser layar ke bawah dari paling atas
// untuk refresh data. Panggil aktifkanPullToRefresh(fungsiRefresh)
// dari halaman yang mau pakai fitur ini.
// ============================================================

function aktifkanPullToRefresh(fungsiRefresh) {
  const indikator = document.getElementById('ptrIndicator');
  if (!indikator) return;

  let mulaiY = 0;
  let menarik = false;
  const AMBANG_BATAS = 70;

  window.addEventListener(
    'touchstart',
    (e) => {
      if (window.scrollY === 0) {
        mulaiY = e.touches[0].clientY;
        menarik = true;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (e) => {
      if (!menarik) return;
      const jarak = e.touches[0].clientY - mulaiY;
      if (jarak > 10 && window.scrollY === 0) {
        indikator.classList.add('active');
      }
    },
    { passive: true }
  );

  window.addEventListener('touchend', async (e) => {
    if (!menarik) return;
    menarik = false;

    const jarakAkhir = (e.changedTouches[0]?.clientY || 0) - mulaiY;
    if (jarakAkhir > AMBANG_BATAS && window.scrollY === 0) {
      await fungsiRefresh();
    }
    indikator.classList.remove('active');
  });
}
