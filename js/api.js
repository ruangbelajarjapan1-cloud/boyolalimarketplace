// ============================================================
// API.JS — Semua fungsi di sini "bicara" ke Supabase.
// Anda TIDAK perlu edit file ini kecuali menambah fitur baru.
//
// PENTING: cara pemanggilan apiGet()/apiPost() dari file lain
// TIDAK BERUBAH sama sekali dari versi Apps Script sebelumnya —
// yang berubah cuma "mesin" di dalam file ini.
// ============================================================

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------------------------------------------
// GET — ambil data
// ------------------------------------------------------------
async function apiGet(action, params = {}) {
  if (!isConfigured()) return { error: 'setup_needed' };

  try {
    switch (action) {
      case 'getProducts': {
        const { data, error } = await supabaseClient.rpc('ambil_produk', {
          p_kabupaten: params.kabupaten || null,
          p_kategori: params.kategori || null,
          p_cari: params.q || null,
        });
        if (error) throw error;
        return data;
      }
      case 'getProduct': {
        const { data, error } = await supabaseClient.rpc('ambil_1_produk', { p_id: params.id });
        if (error) throw error;
        return data && data[0] ? data[0] : { error: 'Produk tidak ditemukan' };
      }
      case 'getMessages': {
        const { data, error } = await supabaseClient.rpc('ambil_pesan', {
          p_terkait_id: params.productId, p_user_a: params.userA, p_user_b: params.userB,
        });
        if (error) throw error;
        return data;
      }
      case 'getChatList': {
        const { data, error } = await supabaseClient.rpc('ambil_daftar_chat', { p_user_id: params.user_id });
        if (error) throw error;
        return data;
      }
      case 'getAds': {
        const { data, error } = await supabaseClient.rpc('ambil_iklan');
        if (error) throw error;
        return data;
      }
      case 'getComments': {
        const { data, error } = await supabaseClient.rpc('ambil_komentar', { p_product_id: params.productId });
        if (error) throw error;
        return data;
      }
    case 'findUserByPhone': {
  const { data, error } = await supabaseClient.rpc('cari_user_by_hp', { p_no_hp: params.no_hp });
  if (error) throw error;
  if (!data || data.length === 0) return { error: 'Nomor HP belum terdaftar. Silakan Daftar dulu.' };
  return { ...data[0], user_id: data[0].id };
}
     case 'getUserById': {
  const { data, error } = await supabaseClient.rpc('ambil_user_by_id', { p_user_id: params.user_id });
  if (error) throw error;
  if (!data || data.length === 0) return { error: 'User tidak ditemukan.' };
  return { ...data[0], user_id: data[0].id };
}
      case 'getMyProducts': {
        const { data, error } = await supabaseClient.rpc('ambil_produk_saya', { p_user_id: params.user_id });
        if (error) throw error;
        return data;
      }
      case 'getFavorites': {
        const { data, error } = await supabaseClient.rpc('ambil_favorit', { p_user_id: params.user_id });
        if (error) throw error;
        return data;
      }
      case 'getRiwayatPembelian': {
        const { data, error } = await supabaseClient.rpc('ambil_riwayat_pembelian', { p_user_id: params.user_id });
        if (error) throw error;
        return data;
      }
      case 'getRatings': {
        const { data, error } = await supabaseClient.rpc('ambil_rating', { p_penjual_id: params.penjual_id });
        if (error) throw error;
        return data;
      }
      case 'adminGetUsers': {
        const { data, error } = await supabaseClient.rpc('admin_ambil_users', { p_password: params.password });
        if (error) return { error: pesanErrorAdmin(error) };
        return data;
      }
      case 'adminGetProducts': {
        const { data, error } = await supabaseClient.rpc('admin_ambil_produk', { p_password: params.password });
        if (error) return { error: pesanErrorAdmin(error) };
        return data;
      }
      case 'adminGetReports': {
        const { data, error } = await supabaseClient.rpc('admin_ambil_laporan', { p_password: params.password });
        if (error) return { error: pesanErrorAdmin(error) };
        return data;
      }
      case 'getPengumuman': {
        const { data, error } = await supabaseClient.rpc('ambil_pengumuman');
        if (error) throw error;
        return data;
      }
      case 'getReferralCount': {
        const { data, error } = await supabaseClient.rpc('hitung_referral', { p_user_id: params.user_id });
        if (error) throw error;
        return data;
      }
      default:
        return { error: 'Aksi tidak dikenal: ' + action };
    }
  } catch (err) {
    return { error: 'Gagal terhubung ke Supabase: ' + (err.message || 'Cek koneksi internet Anda.') };
  }
}

// ------------------------------------------------------------
// POST — kirim/ubah data
// ------------------------------------------------------------
async function apiPost(action, data = {}) {
  if (!isConfigured()) return { error: 'setup_needed' };

  try {
    switch (action) {
      case 'addUser': {
        const { data: hasil, error } = await supabaseClient.rpc('daftar_user', {
          p_nama: data.nama, p_no_hp: data.no_hp,
          p_lokasi_kecamatan: data.lokasi_kecamatan, p_kabupaten: data.kabupaten,
          p_kode_referral_dipakai: data.kode_referral_dipakai || null,
        });
        if (error) throw error;
        return hasil;
      }
      case 'addProduct': {
        const { data: hasil, error } = await supabaseClient.rpc('upload_produk', {
          p_user_id: data.user_id, p_nama_barang: data.nama_barang, p_kategori: data.kategori,
          p_harga: data.harga || 0, p_deskripsi: data.deskripsi,
          p_foto_url: data.foto_url || '', p_foto_url_2: data.foto_url_2 || null, p_foto_url_3: data.foto_url_3 || null,
          p_lokasi: data.lokasi, p_kabupaten: data.kabupaten, p_butuh_cepat: data.butuh_cepat || false,
        });
        if (error) throw error;
        return hasil;
      }
      case 'sendMessage': {
        const { data: hasil, error } = await supabaseClient.rpc('kirim_pesan', {
          p_terkait_id: data.terkait_id, p_pengirim_id: data.pengirim_id,
          p_penerima_id: data.penerima_id, p_isi_pesan: data.isi_pesan,
        });
        if (error) throw error;
        return hasil;
      }
      case 'markMessagesRead': {
        const { data: hasil, error } = await supabaseClient.rpc('tandai_pesan_dibaca', {
          p_terkait_id: data.terkait_id, p_user_id: data.user_id, p_lawan_id: data.lawan_id,
        });
        if (error) throw error;
        return hasil;
      }
      case 'markDone': {
        const { data: hasil, error } = await supabaseClient.rpc('ubah_status_produk', {
          p_product_id: data.product_id, p_status: 'Terjual',
        });
        if (error) throw error;
        return hasil;
      }
      case 'markAvailable': {
        const { data: hasil, error } = await supabaseClient.rpc('ubah_status_produk', {
          p_product_id: data.product_id, p_status: 'Tersedia',
        });
        if (error) throw error;
        return hasil;
      }
      case 'uploadImage':
        return await uploadFotoKeSupabase(data);
      case 'deleteProduct': {
        const { data: hasil, error } = await supabaseClient.rpc('hapus_produk', {
          p_product_id: data.product_id, p_user_id: data.user_id,
        });
        if (error) throw error;
        return hasil;
      }
      case 'updateProduct': {
        const { data: hasil, error } = await supabaseClient.rpc('edit_produk', {
          p_product_id: data.product_id, p_user_id: data.user_id,
          p_nama_barang: data.nama_barang || '', p_kategori: data.kategori || '',
          p_harga: data.harga || null, p_deskripsi: data.deskripsi || '',
          p_foto_url: data.foto_url || '', p_foto_url_2: data.foto_url_2 || '', p_foto_url_3: data.foto_url_3 || '',
          p_lokasi: data.lokasi || '', p_kabupaten: data.kabupaten || '',
          p_butuh_cepat: data.butuh_cepat === true,
        });
        if (error) throw error;
        return hasil;
      }
      case 'addComment': {
        const { data: hasil, error } = await supabaseClient.rpc('tambah_komentar', {
          p_product_id: data.product_id, p_user_id: data.user_id,
          p_nama_pengirim: data.nama_pengirim, p_isi_komentar: data.isi_komentar,
        });
        if (error) throw error;
        return hasil;
      }
      case 'addFavorite': {
        const { data: hasil, error } = await supabaseClient.rpc('tambah_favorit', {
          p_user_id: data.user_id, p_product_id: data.product_id,
        });
        if (error) throw error;
        return hasil;
      }
      case 'removeFavorite': {
        const { data: hasil, error } = await supabaseClient.rpc('hapus_favorit', {
          p_user_id: data.user_id, p_product_id: data.product_id,
        });
        if (error) throw error;
        return hasil;
      }
      case 'addRating': {
        const { data: hasil, error } = await supabaseClient.rpc('tambah_rating', {
          p_product_id: data.product_id, p_penjual_id: data.penjual_id,
          p_pembeli_id: data.pembeli_id, p_nilai: data.nilai, p_komentar: data.komentar || null,
        });
        if (error) throw error;
        return hasil;
      }
      case 'addReport': {
        const { data: hasil, error } = await supabaseClient.rpc('tambah_laporan', {
          p_jenis: data.jenis, p_target_id: data.target_id, p_target_nama: data.target_nama,
          p_pelapor_id: data.pelapor_id, p_alasan: data.alasan,
        });
        if (error) throw error;
        return hasil;
      }
      case 'adminSetVerified': {
        const { data: hasil, error } = await supabaseClient.rpc('admin_set_verifikasi', {
          p_password: data.password, p_user_id: data.user_id, p_verified: data.verified,
        });
        if (error) return { error: pesanErrorAdmin(error) };
        return hasil;
      }
      case 'adminSetFeatured': {
        const { data: hasil, error } = await supabaseClient.rpc('admin_set_unggulan', {
          p_password: data.password, p_product_id: data.product_id, p_aktif: data.aktif, p_hari: data.hari || 7,
        });
        if (error) return { error: pesanErrorAdmin(error) };
        return hasil;
      }
      case 'adminSundul': {
        const { data: hasil, error } = await supabaseClient.rpc('admin_sundul', {
          p_password: data.password, p_product_id: data.product_id,
        });
        if (error) return { error: pesanErrorAdmin(error) };
        return hasil;
      }
        case 'adminDeleteProduct': {
  const { data: hasil, error } = await supabaseClient.rpc('admin_hapus_produk', {
    p_password: data.password, p_product_id: data.product_id,
  });
  if (error) return { error: pesanErrorAdmin(error) };
  return hasil;
}
      case 'adminSetToko': {
        const { data: hasil, error } = await supabaseClient.rpc('admin_set_toko', {
          p_password: data.password, p_user_id: data.user_id, p_aktif: data.aktif, p_hari: data.hari || 30,
        });
        if (error) return { error: pesanErrorAdmin(error) };
        return hasil;
      }
      case 'adminAddAd': {
        const { data: hasil, error } = await supabaseClient.rpc('admin_tambah_iklan', {
          p_password: data.password, p_nama_pengiklan: data.nama_pengiklan,
          p_gambar_url: data.gambar_url, p_link_tujuan: data.link_tujuan,
        });
        if (error) return { error: pesanErrorAdmin(error) };
        return hasil;
      }
      case 'addPengumuman': {
        const { data: hasil, error } = await supabaseClient.rpc('tambah_pengumuman', {
          p_user_id: data.user_id, p_nama_pengirim: data.nama_pengirim, p_jenis: data.jenis,
          p_judul: data.judul, p_isi: data.isi, p_foto_url: data.foto_url || null,
        });
        if (error) throw error;
        return hasil;
      }
      default:
        return { error: 'Aksi tidak dikenal: ' + action };
    }
  } catch (err) {
    return { error: 'Gagal terhubung ke Supabase: ' + (err.message || 'Cek koneksi internet Anda.') };
  }
}

// Fungsi database (RPC) yang butuh password admin akan "raise exception"
// kalau password salah — pesan errornya perlu dirapikan sebelum ditampilkan
function pesanErrorAdmin(error) {
  if (error && error.message && error.message.indexOf('Password admin salah') !== -1) {
    return 'Password admin salah.';
  }
  return error.message || 'Terjadi kesalahan.';
}

// ------------------------------------------------------------
// UPLOAD FOTO — ke Supabase Storage (pengganti Google Drive)
// ------------------------------------------------------------
async function uploadFotoKeSupabase(data) {
  try {
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const namaFile = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const { error } = await supabaseClient.storage
      .from('foto-barang')
      .upload(namaFile, bytes, { contentType: data.mimeType || 'image/jpeg' });

    if (error) return { error: 'Gagal upload foto: ' + error.message };

    const { data: urlData } = supabaseClient.storage.from('foto-barang').getPublicUrl(namaFile);
    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return { error: 'Gagal upload foto: ' + (err.message || 'unknown error') };
  }
}
