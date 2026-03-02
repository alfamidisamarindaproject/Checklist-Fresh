/**
 * PENTING: Ganti URL di bawah dengan URL Deployment dari Google Apps Script
 */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyGPJq8V8dvxL5HRfrapqzP9CJPp63-h2tONbJsDfyoSB_iXnONCC2lXPERuyd2UDWK/exec';

const photos = {
    dis: null,
    rep: null
};

// Inisialisasi Event Listener
document.addEventListener('DOMContentLoaded', () => {
    // Foto Display
    document.getElementById('box-dis').onclick = () => document.getElementById('in-dis').click();
    setupImageHandler('in-dis', 'p-dis', 'dis');

    // Foto Repack
    document.getElementById('box-rep').onclick = () => document.getElementById('in-rep').click();
    setupImageHandler('in-rep', 'p-rep', 'rep');

    // Input Identitas
    document.getElementById('toko').oninput = validateForm;
    document.getElementById('pic').oninput = validateForm;

    // Tombol Kirim
    document.getElementById('btn-submit').onclick = submitData;
});

/**
 * Memproses file gambar dan mengoptimalkannya
 */
function setupImageHandler(inputId, previewId, key) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            // Optimasi: Tampilkan preview terlebih dahulu
            preview.src = ev.target.result;
            preview.style.display = 'block';
            
            // Simpan ke state
            photos[key] = ev.target.result;
            
            validateForm();
        };
        reader.readAsDataURL(file);
    };
}

/**
 * Validasi agar tombol kirim hanya aktif jika semua data terisi
 */
function validateForm() {
    const toko = document.getElementById('toko').value.trim();
    const pic = document.getElementById('pic').value.trim();
    const btn = document.getElementById('btn-submit');

    const isComplete = toko !== "" && pic !== "" && photos.dis !== null && photos.rep !== null;
    btn.disabled = !isComplete;
}

/**
 * Mengirim data ke Google Apps Script
 */
async function submitData() {
    Swal.fire({
        title: 'Mengirim Laporan...',
        text: 'Sedang mengunggah data dan foto ke sistem.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const payload = {
        toko: document.getElementById('toko').value.trim().toUpperCase(),
        pic: document.getElementById('pic').value.trim().toUpperCase(),
        culling: document.getElementById('culling').checked,
        trimming: document.getElementById('trimming').checked,
        crisping: document.getElementById('crisping').checked,
        foto_display: photos.dis,
        foto_repack: photos.rep
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Terkirim!',
                text: 'Data monitoring berhasil disimpan.',
                confirmButtonColor: '#000'
            }).then(() => location.reload());
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Mengirim',
            text: 'Terjadi kesalahan. Pastikan URL Script benar dan internet aktif.',
            confirmButtonColor: '#ED1C24'
        });
    }
}
