/**
 * KONFIGURASI: Ganti URL di bawah dengan URL Web App 
 * yang Anda dapatkan setelah Deploy Google Apps Script.
 */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGPJq8V8dvxL5HRfrapqzP9CJPp63-h2tONbJsDfyoSB_iXnONCC2lXPERuyd2UDWK/exec';

// State untuk menyimpan data foto dalam format Base64
let photos = {
    dis: null, // Foto Display
    rep: null  // Foto Repack
};

/**
 * Inisialisasi Event Listener saat dokumen siap
 */
document.addEventListener('DOMContentLoaded', () => {
    // Setup Handler untuk Foto Display
    setupCameraHandler('in-dis', 'p-dis', 'dis');
    
    // Setup Handler untuk Foto Repack
    setupCameraHandler('in-rep', 'p-rep', 'rep');

    // Listener untuk validasi input teks (Kode Toko & Nama PIC)
    document.getElementById('toko').addEventListener('input', checkValidation);
    document.getElementById('pic').addEventListener('input', checkValidation);
    
    // Listener untuk tombol Kirim
    document.getElementById('btn-submit').addEventListener('click', handleSubmit);
});

/**
 * Fungsi untuk menangani proses pengambilan foto
 */
function setupCameraHandler(inputId, previewId, key) {
    const fileInput = document.getElementById(inputId);
    const previewImg = document.getElementById(previewId);

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Tampilkan loading sederhana pada area foto
        Swal.showLoading();

        const reader = new FileReader();
        reader.onload = (event) => {
            // Simpan hasil base64 ke dalam object photos
            photos[key] = event.target.result;
            
            // Tampilkan preview foto ke user
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
            
            Swal.close();
            checkValidation(); // Cek apakah tombol kirim sudah bisa aktif
        };
        reader.readAsDataURL(file);
    };
}

/**
 * Fungsi Validasi: Memastikan semua kolom wajib diisi
 */
function checkValidation() {
    const toko = document.getElementById('toko').value.trim();
    const pic = document.getElementById('pic').value.trim();
    const btn = document.getElementById('btn-submit');

    // Syarat: Toko ada, PIC ada, Foto Display ada, Foto Repack ada
    const isValid = toko !== "" && pic !== "" && photos.dis !== null && photos.rep !== null;

    btn.disabled = !isValid;
}

/**
 * Fungsi Kirim Data (Submit)
 */
async function handleSubmit() {
    // Tampilkan animasi loading modern
    Swal.fire({
        title: 'Sedang Mengirim...',
        text: 'Data dan Foto sedang diupload ke GDrive & GSheet',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Susun data yang akan dikirim ke Apps Script
    const payload = {
        toko: document.getElementById('toko').value.toUpperCase(),
        pic: document.getElementById('pic').value.toUpperCase(),
        culling: document.getElementById('culling').checked,
        trimming: document.getElementById('trimming').checked,
        crisping: document.getElementById('crisping').checked,
        foto_display: photos.dis,
        foto_repack: photos.rep
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk menghindari isu CORS pada Apps Script
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // Karena mode 'no-cors', kita tidak bisa membaca isi respon secara detail,
        // Namun jika tidak masuk ke catch, biasanya pengiriman berhasil.
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Laporan monitoring telah tersimpan.',
            confirmButtonColor: '#000'
        }).then(() => {
            // Segarkan halaman agar form kembali kosong (Reset)
            location.reload();
        });

    } catch (error) {
        console.error('Error saat mengirim data:', error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Terkirim',
            text: 'Terjadi kesalahan saat menghubungi server. Pastikan URL SCRIPT sudah benar.',
            confirmButtonColor: '#ED1C24'
        });
    }
}
