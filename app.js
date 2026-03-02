/**
 * JAVASCRIPT - LOGIC & UI INTERACTION
 */

// GANTI DENGAN URL WEB APP HASIL DEPLOY GOOGLE APPS SCRIPT
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzfRHnLr3Py8xNh4Dmr6tXx-v_HLciCtOWgfD0AEKHB2TfqiG5pPcuKVG4sCvt_Klng/exec';

const state = {
    foto_display: null,
    foto_repack: null
};

document.addEventListener('DOMContentLoaded', () => {
    // Event Click pada Box Kamera
    document.getElementById('box-dis').onclick = () => document.getElementById('in-dis').click();
    document.getElementById('box-rep').onclick = () => document.getElementById('in-rep').click();

    // Event Handler Input Foto
    setupImageHandler('in-dis', 'p-dis', 'foto_display');
    setupImageHandler('in-rep', 'p-rep', 'foto_repack');

    // Validasi Form saat input berubah
    const inputs = ['toko', 'pic'];
    inputs.forEach(id => {
        document.getElementById(id).oninput = validateForm;
    });

    // Submit Action
    document.getElementById('btn-submit').onclick = handleSubmit;
});

function setupImageHandler(inputId, previewId, key) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            // Optimasi: Simpan data base64
            state[key] = ev.target.result;
            
            // UI Update
            preview.src = ev.target.result;
            preview.style.display = 'block';
            
            validateForm();
        };
        reader.readAsDataURL(file);
    };
}

function validateForm() {
    const toko = document.getElementById('toko').value.trim();
    const pic = document.getElementById('pic').value.trim();
    const btn = document.getElementById('btn-submit');

    // Aktif jika Identitas & Kedua Foto terisi
    const isValid = toko && pic && state.foto_display && state.foto_repack;
    btn.disabled = !isValid;
}

async function handleSubmit() {
    const btn = document.getElementById('btn-submit');
    
    Swal.fire({
        title: 'Mengirim Laporan...',
        text: 'Mohon tunggu sejenak',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const payload = {
        toko: document.getElementById('toko').value,
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
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Laporan telah disimpan di Google Sheets.',
                confirmButtonColor: '#1C1C1E'
            }).then(() => location.reload());
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Mengirim',
            text: 'Cek koneksi internet atau URL Deployment Anda.',
            confirmButtonColor: '#ED1C24'
        });
        console.error(err);
    }
}
