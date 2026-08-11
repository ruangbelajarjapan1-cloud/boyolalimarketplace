# Dulur — Marketplace Boyolali & Sekitarnya (MVP Tahap 0)

Proyek ini adalah **versi awal (MVP)** dari rencana marketplace C2C untuk
Boyolali: HTML/CSS/JS sederhana + Google Spreadsheet sebagai database.
Tidak perlu install apa pun di komputer — cukup browser & akun Google.

Ikuti langkah-langkah di bawah ini **satu per satu, jangan dilompat**.

---

## Langkah 1 — Buat Google Spreadsheet

1. Buka [sheets.google.com](https://sheets.google.com), buat spreadsheet baru.
2. Beri nama file: `DB_MarketplaceBoyolali`.
3. Buat tab-tab berikut (klik `+` di pojok kiri bawah), nama **persis**:
   - `Users`, `Products`, `ChatLogs`, `Iklan`, `Komentar`, `Rating`, `Favorit`, `Laporan`, `Pengumuman`
4. Isi **baris pertama** tiap tab dengan header ini:

**`Users`:**
```
user_id	nama	no_hp	email	password_hash	lokasi_kecamatan	kabupaten	foto_profil_url	is_verified_ktp	tanggal_daftar	kode_referral	direferensikan_oleh	is_toko	toko_sampai
```

**`Products`:**
```
product_id	user_id	nama_barang	kategori	harga	deskripsi	foto_url	foto_url_2	foto_url_3	status	lokasi	kabupaten	unggulan	unggulan_sampai	tanggal_upload	butuh_cepat	jumlah_dilihat
```

**`ChatLogs`:**
```
chat_id	terkait_id	pengirim_id	penerima_id	isi_pesan	dibaca	waktu
```

**`Iklan`:**
```
iklan_id	nama_pengiklan	gambar_url	link_tujuan	aktif	tanggal_mulai	tanggal_selesai
```

**`Komentar`:**
```
komentar_id	product_id	user_id	nama_pengirim	isi_komentar	waktu
```

**`Rating`:**
```
rating_id	product_id	penjual_id	pembeli_id	nilai	komentar	waktu
```

**`Favorit`:**
```
favorit_id	user_id	product_id	waktu
```

**`Laporan`:**
```
laporan_id	jenis	target_id	target_nama	pelapor_id	alasan	waktu
```

**`Pengumuman`:**
```
pengumuman_id	user_id	nama_pengirim	jenis	judul	isi	foto_url	waktu
```

> **Catatan penting:** urutan kolom di atas **tidak harus persis** — sistem
> menulis data berdasarkan **nama header**, bukan posisi tetap. Jadi aman
> kalau Anda mau tambah/geser kolom lain nanti.

**Checkbox:** ubah kolom `unggulan`, `dibaca` (ChatLogs), `aktif` (Iklan),
`is_toko`, `butuh_cepat` jadi tipe **checkbox** (blok kolom > Insert >
Checkbox) — tapi **hati-hati**, format 1 baris saja dulu, jangan apply ke
banyak baris kosong sekaligus (pernah bikin masalah "data nyasar ke bawah").

---

## Langkah 2 — Pasang "jembatan" Apps Script

1. Di spreadsheet yang sama, klik menu **Extensions > Apps Script**.
2. Akan terbuka tab baru dengan editor kode kosong (isi default `function myFunction() {}`).
3. **Hapus semua isi default itu.**
4. Buka file `apps-script/Code.gs` di folder project ini, **copy semua isinya**,
   lalu **paste** ke editor Apps Script tadi.
5. Klik ikon disket (Save). Beri nama project misalnya `API Marketplace Boyolali`.
6. Klik tombol biru **Deploy** (kanan atas) > **New deployment**.
7. Klik ikon gerigi ⚙️ di sebelah "Select type", pilih **Web app**.
8. Isi:
   - Description: `v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Klik **Deploy**. Google akan minta izin akses (klik akun Anda > Advanced >
   "Go to [nama project] (unsafe)" > Allow). Ini normal karena project belum
   diverifikasi Google, dan itu tidak masalah karena ini punya Anda sendiri.
10. Setelah selesai, akan muncul **Web app URL** — bentuknya seperti:
    ```
    https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXX/exec
    ```
    **Copy URL ini.** Anda akan pakai di Langkah 3.

> Setiap kali Anda **mengubah** isi Code.gs di kemudian hari, Anda harus
> `Deploy > Manage deployments > ikon pensil > Version: New version > Deploy`
> lagi supaya perubahan aktif.

### Langkah 2b — Atur Password Panel Admin (wajib untuk fitur verifikasi & unggulan)

1. Masih di editor Apps Script, klik ikon gerigi ⚙️ **Project Settings** di kiri.
2. Scroll ke bagian **Script Properties** > klik **Add script property**.
3. Property: `ADMIN_PASSWORD`, Value: buat password sendiri (mis. `boyolali123`
   — ganti dengan yang lebih aman).
4. Klik **Save script properties**.

Password ini **tidak pernah muncul di kode/website Anda** — jadi aman dari
publik, hanya Anda yang tahu.

---

## Langkah 3 — Sambungkan website ke Apps Script

1. Buka file `js/config.js` di project ini.
2. Ganti baris:
   ```js
   const APPS_SCRIPT_URL = 'GANTI_DENGAN_URL_APPS_SCRIPT_ANDA';
   ```
   dengan URL yang Anda copy di Langkah 2, contoh:
   ```js
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXXXXX/exec';
   ```
3. Simpan file.

---

## Langkah 4 — Coba jalankan di komputer Anda

Cara termudah untuk pemula: pakai ekstensi **Live Server** di VS Code.

1. Install [VS Code](https://code.visualstudio.com/) kalau belum ada.
2. Buka folder project ini di VS Code.
3. Install ekstensi **"Live Server"** (cari di tab Extensions, ikon kotak di kiri).
4. Klik kanan file `index.html` > **Open with Live Server**.
5. Browser akan terbuka otomatis. Coba:
   - Buka halaman Home — kalau belum ada barang, akan muncul pesan "Belum ada barang".
   - Klik menu **Upload**, isi form, klik Posting Barang.
   - Kembali ke Home — barang tadi harus muncul.
   - Cek juga spreadsheet Anda — baris baru harus otomatis muncul di tab `Products`.

**Kalau gagal / muncul error di layar putih:** buka DevTools browser (klik kanan
> Inspect > tab Console) dan baca pesan errornya — biasanya karena URL Apps
Script di `config.js` salah, atau nama tab spreadsheet tidak persis sama.

---

## Langkah 5 — Upload ke GitHub

1. Buat akun di [github.com](https://github.com) kalau belum punya.
2. Klik **New repository**. Nama misalnya `marketplace-boyolali`. Set ke **Public**
   (supaya GitHub Pages gratis bisa dipakai). Jangan centang "Add README" (project
   ini sudah punya).
3. Di komputer Anda, buka Terminal (di VS Code: menu Terminal > New Terminal),
   pastikan posisi ada di dalam folder project ini, lalu jalankan baris-baris ini
   satu per satu:
   ```
   git init
   git add .
   git commit -m "Versi awal marketplace Boyolali"
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/marketplace-boyolali.git
   git push -u origin main
   ```
   (Ganti `USERNAME-ANDA` dengan username GitHub Anda — ambil dari URL repo yang
   tadi Anda buat.)
4. Refresh halaman repo di GitHub — semua file harusnya sudah muncul di sana.

---

## Langkah 6 — Aktifkan GitHub Pages (biar bisa diakses lewat link, gratis)

1. Di halaman repo GitHub Anda, klik **Settings**.
2. Di menu kiri, klik **Pages**.
3. Di bagian "Build and deployment" > Source, pilih **Deploy from a branch**.
4. Branch: pilih `main`, folder: `/ (root)`. Klik **Save**.
5. Tunggu 1-2 menit, refresh halaman. Akan muncul link seperti:
   ```
   https://USERNAME-ANDA.github.io/marketplace-boyolali/
   ```
6. Buka link itu — website Anda sudah online dan bisa dibuka siapa saja,
   termasuk dari HP teman Anda di Boyolali!

---

---

## Cara Anda Dapat Uang (operasional, tanpa payment gateway dulu)

Di tahap MVP ini, sengaja **belum ada sistem pembayaran otomatis** (integrasi
payment gateway itu rumit & butuh izin khusus — lihat Bagian 2 & 7 di dokumen
rencana bisnis). Sebagai gantinya, dua fitur uang di bawah ini **Anda proses
secara manual lewat spreadsheet**, ini normal untuk tahap awal:

### A. Listing Unggulan (Premium Listing)

1. Penjual yang mau barangnya tampil di posisi atas, hubungi Anda (lewat WA,
   misalnya) dan transfer sejumlah uang (tentukan sendiri harganya, mis. Rp
   10.000 untuk 7 hari).
2. Setelah uang masuk, buka tab `Products` di spreadsheet, cari baris barang
   itu (cocokkan `product_id` — bisa dilihat penjual dari URL halaman
   detailnya).
3. Centang kolom `unggulan` jadi `TRUE`.
4. Isi kolom `unggulan_sampai` dengan tanggal berakhirnya (mis. `2026-08-13`).
5. Selesai — barang itu otomatis tampil di paling atas Home sampai tanggal
   tersebut lewat, lalu otomatis kembali ke urutan biasa.

### B. Iklan Lokal (Banner)

1. Toko/UMKM lokal yang mau pasang banner, kirim gambar banner (rasio lebar
   3:1, misal 900x300px) dan link tujuan (nomor WA toko, dsb) ke Anda,
   beserta pembayarannya.
2. Upload gambar itu ke Google Drive (klik kanan > Share > Anyone with the
   link > copy link gambarnya), atau layanan seperti Imgur/Postimages.
3. Buka tab `Iklan`, tambah baris baru: isi `nama_pengiklan`, `gambar_url`,
   `link_tujuan`, centang `aktif` jadi `TRUE`, isi tanggal mulai & selesai.
4. Banner otomatis muncul di paling atas halaman Home selama periode aktif.

### C. Verifikasi Akun (Badge Terverifikasi)

1. User kirim foto KTP ke Anda (lewat WA) untuk minta badge "Terverifikasi"
   — bisa gratis dulu di awal, atau berbayar kecil setelah user bertambah.
2. Anda cek kecocokan nama, lalu di tab `Users`, cari user itu dan ubah
   kolom `is_verified_ktp` jadi `TRUE`.
3. Badge ✅ otomatis muncul di semua listing & halaman detail milik user itu.

> Semua proses manual ini memang belum efisien untuk ratusan user — tapi
> untuk puluhan/ratusan transaksi pertama, ini cukup dan tidak butuh biaya
> tambahan apa pun. Begitu Anda pindah ke Supabase (lihat "Langkah
> Selanjutnya" di bawah), proses ini bisa diotomatisasi lewat dashboard
> admin sederhana.

---

## Halaman-halaman yang Tersedia

| Halaman | Untuk siapa | Fungsi |
|---|---|---|
| `index.html` | Semua orang | Home, lihat & cari barang |
| `produk.html` | Semua orang | Detail 1 barang |
| `daftar.html` | Pengguna baru | Bikin akun (nama, no HP, lokasi) |
| `login.html` | Pengguna lama | Masuk pakai nomor HP yang sudah terdaftar |
| `upload.html` | Pengguna (wajib login) | Posting barang jualan |
| `chat.html` | Pengguna (wajib login) | Chat dengan penjual/pembeli |
| `profil.html` | Semua orang | Lihat status akun, badge verifikasi, tombol Keluar |
| `admin.html` | **Hanya Anda** (pengelola) | Verifikasi user, aktifkan listing unggulan, tambah iklan |

**Alur login sederhana:** kalau Pengguna klik Upload atau Chat tapi belum
punya akun tersimpan di browsernya, otomatis diarahkan ke `daftar.html`,
lalu setelah selesai daftar dikembalikan lagi ke halaman tujuan.

**Soal verifikasi KTP:** belum ada upload foto otomatis di tahap MVP ini.
Alurnya: Pengguna kirim foto KTP ke WhatsApp Anda secara manual → Anda cek
kecocokan nama → buka `admin.html` → klik "Verifikasi" pada nama orang itu.
Badge ✅ langsung muncul di semua listingnya.

**Panel Admin (`admin.html`) tidak muncul di menu navigasi mana pun** —
sengaja disembunyikan dari pengguna umum. Anda akses langsung lewat URL,
contoh: `https://username-anda.github.io/marketplace-boyolali/admin.html`

---

## Troubleshooting (Masalah Umum)

**Muncul pesan merah di atas layar "Backend belum disambungkan":**
Anda belum menyelesaikan Langkah 2-3 di atas. Cek `js/config.js` — pastikan
`APPS_SCRIPT_URL` sudah diganti dengan URL asli (bukan lagi tulisan
`GANTI_DENGAN...`), dan URL-nya berakhiran `/exec`.

**Muncul error di Console seperti `404 Not Found` yang isinya mengarah ke
alamat GitHub Pages Anda sendiri (bukan `script.google.com`):**
Sama seperti di atas — `config.js` belum diisi, jadi browser mengira URL
Apps Script Anda adalah halaman biasa di website Anda sendiri. Isi
`config.js`, lalu upload ulang file itu ke GitHub (`git add`, `git commit`,
`git push`), tunggu 1-2 menit sampai GitHub Pages update.

**Setelah isi `config.js` masih error:** cek 2 hal ini di editor Apps
Script Anda: (1) sudah pernah **Deploy** (bukan cuma Save), dan (2) saat
Deploy, "Who has access" **harus** diset ke **Anyone** (bukan "Only myself").

---

## Setelah ini: apa yang bisa Anda coba dulu

- Kirim link GitHub Pages Anda ke 5-10 orang di Boyolali (sesuai rencana
  validasi di Bagian 8 dokumen rencana bisnis). Minta mereka coba upload
  barang & chat.
- Perhatikan apa yang membingungkan mereka — itu bahan perbaikan UI Anda.

## Langkah Selanjutnya (setelah MVP ini terasa terlalu terbatas)

Tanda-tanda Anda perlu upgrade (lihat juga Bagian 3.4 di dokumen rencana bisnis):
- Pengguna aktif mendekati 200-300 orang, atau
- Chat terasa lambat/lag (karena masih polling tiap 3 detik, bukan realtime asli), atau
- Anda butuh upload foto langsung dari HP (bukan tempel link).

Kalau salah satu itu terjadi, langkah berikutnya: pindah `js/api.js` supaya
memanggil **Supabase** (database + Realtime + Storage foto) alih-alih Apps
Script, dengan struktur kolom tabel yang sama persis seperti di spreadsheet
ini — jadi tidak perlu desain ulang dari nol.

---

## Struktur folder proyek ini

```
marketplace-boyolali/
├── index.html          # Halaman Home
├── produk.html          # Halaman Detail Barang
├── daftar.html           # Daftar akun baru
├── login.html             # Masuk (pakai no HP)
├── upload.html             # Upload Barang
├── chat.html                # Chat per barang
├── chat-list.html            # Daftar chat (versi sederhana)
├── profil.html                 # Profil & status verifikasi
├── admin.html                   # Panel admin (verifikasi, unggulan, iklan)
├── css/
│   └── style.css                 # Semua styling — edit warna di bagian :root
├── js/
│   ├── config.js                  # WAJIB diedit: URL Apps Script Anda
│   ├── setup-check.js              # Banner peringatan kalau config.js belum diisi
│   ├── api.js                       # Fungsi komunikasi ke Apps Script
│   ├── session.js                    # Identitas pengguna (simpan di browser)
│   ├── home.js, upload.js, detail.js, chat.js, daftar.js, login.js, admin.js
├── img/
│   └── placeholder.svg               # Gambar default kalau produk tanpa foto
├── apps-script/
│   └── Code.gs                        # Paste isi file ini ke Google Apps Script
├── PERATURAN.md                        # Syarat & Ketentuan, Peraturan Komunitas, Privasi
└── README.md                            # File ini
```
