/**
 * APP LOGIC - FRESH MONITORING
 * Fitur: Client-side Image Compression & CORS Handling
 */

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzWzUA6vsOw26i_eZHK4Uyx1eJ9SiF4FjuY5Yo9V3FHZjAUkE-xf-6CXgQrXdK3A-zz/exec'; // Ganti dengan URL /exec Anda
const state = { foto_display: null, foto_repack: null };

document.addEventListener('DOMContentLoaded', () => {
    // Setup Camera Click
    document.getElementById('box-dis').onclick = () => document.getElementById('in-dis').click();
    document.getElementById('box-rep').onclick = () => document.getElementById('in-rep').click();

    // Setup Image Handlers
    handleImage('in-dis', 'p-dis', 'foto_display');
    handleImage('in-rep', 'p-rep', 'foto_repack');

    // Setup Validation
    ['toko', 'pic'].forEach(id => document.getElementById(id).oninput = validate);
    document.getElementById('btn-submit').onclick = sendData;
});

function handleImage(inputId, previewId, key) {
    document.getElementById(inputId).onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                // FITUR KOMPRESI: Resize ke lebar maksimal 1024px
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Kualitas 0.7 (70%) sangat cukup untuk dokumentasi, ukuran file jadi sangat kecil
                const compressedData = canvas.toDataURL('image/jpeg', 0.7);
                state[key] = compressedData;
                
                const preview = document.getElementById(previewId);
                preview.src = compressedData;
                preview.style.display = 'block';
                validate();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
}

function validate() {
    const isReady = document.getElementById('toko').value && 
                    document.getElementById('pic').value && 
                    state.foto_display && state.foto_repack;
    document.getElementById('btn-submit').disabled = !isReady;
}

async function sendData() {
    Swal.fire({ title: 'Mengunggah Data...', text: 'Foto sedang dikompresi & dikirim', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const payload = {
        toko: document.getElementById('toko').value.toUpperCase(),
        pic: document.getElementById('pic').value,
        culling: document.getElementById('culling').checked,
        trimming: document.getElementById('trimming').checked,
        crisping: document.getElementById('crisping').checked,
        foto_display: state.foto_display,
        foto_repack: state.foto_repack
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Menghindari CORS issues pada beberapa domain
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Karena mode 'no-cors', kita beri delay sedikit lalu anggap sukses 
        // jika tidak masuk ke catch block
        setTimeout(() => {
            Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Laporan telah masuk ke sistem.', confirmButtonColor: '#1C1C1E' })
                .then(() => location.reload());
        }, 1500);

    } catch (err) {
        Swal.fire('Gagal!', 'Terjadi kesalahan pengiriman. Cek koneksi.', 'error');
        console.error(err);
    }
}
