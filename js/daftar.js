<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Daftar - Marketplace Boyolali</title>
  <link rel="stylesheet" href="css/style.css?v=2" />
</head>
<body>

  <div class="app-header">
    <a href="index.html" class="header-back" aria-label="Kembali ke Home">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    </a>
    Daftar Akun
  </div>

  <div class="container">
    <div class="info-note">
      Ini pendaftaran sederhana untuk tahap uji coba (belum pakai password).
      Sudah pernah daftar? <a href="login.html">Masuk di sini</a>.
    </div>

    <form id="daftarForm">
      <div class="form-group">
        <label>Nama Lengkap</label>
        <input type="text" id="nama" required placeholder="mis. Budi Santoso" />
      </div>

      <div class="form-group">
        <label>Nomor HP/WhatsApp</label>
        <input type="tel" id="no_hp" required placeholder="mis. 0812xxxxxxx" />
      </div>

      <div class="form-group">
        <label>Kecamatan</label>
        <input type="text" id="lokasi_kecamatan" required placeholder="mis. Boyolali Kota" />
      </div>

      <div class="form-group">
        <label>Kabupaten/Kota</label>
        <select id="kabupaten" required>
          <option value="Boyolali">Boyolali</option>
          <option value="Surakarta (Solo)">Surakarta (Solo)</option>
          <option value="Sukoharjo">Sukoharjo</option>
          <option value="Karanganyar">Karanganyar</option>
          <option value="Sragen">Sragen</option>
          <option value="Klaten">Klaten</option>
          <option value="Semarang">Semarang</option>
          <option value="Salatiga">Salatiga</option>
          <option value="Wonogiri">Wonogiri</option>
        </select>
      </div>

      <button type="submit" class="btn btn-primary">Daftar</button>
    </form>
  </div>

  <script src="js/config.js?v=2"></script>
  <script src="js/setup-check.js?v=2"></script>
  <script src="js/api.js?v=2"></script>
  <script src="js/session.js?v=2"></script>
  <script src="js/daftar.js?v=2"></script>
</body>
</html>
