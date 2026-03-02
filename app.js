const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzWzUA6vsOw26i_eZHK4Uyx1eJ9SiF4FjuY5Yo9V3FHZjAUkE-xf-6CXgQrXdK3A-zz/exec';
const state = { foto_display: null, foto_repack: null };

function setupImageHandler(inputId, previewId, key) {
    const input = document.getElementById(inputId);
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                // Kompresi Gambar ke 800px (Menghindari Timeout)
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
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
                
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                state[key] = compressedBase64;
                
                const preview = document.getElementById(previewId);
                preview.src = compressedBase64;
                preview.style.display = 'block';
                validate();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
}

setupImageHandler('in-dis', 'p-dis', 'foto_display');
setupImageHandler('in-rep', 'p-rep', 'foto_repack');

function validate() {
    const toko = document.getElementById('toko').value.trim();
    const pic = document.getElementById('pic').value.trim();
    const btn = document.getElementById('btn-submit');
    btn.disabled = !(toko && pic && state.foto_display && state.foto_repack);
}

document.getElementById('toko').oninput = validate;
document.getElementById('pic').oninput = validate;

document.getElementById('btn-submit').onclick = async () => {
    Swal.fire({ title: 'Mengirim...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

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
        // Gunakan fetch dengan mode 'cors' dan pastikan URL diakhiri /exec
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'cors', 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === 'success') {
            Swal.fire('Berhasil!', 'Data telah disimpan.', 'success').then(() => location.reload());
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        Swal.fire('Gagal!', 'Pastikan URL Script benar dan internet aktif.', 'error');
        console.error(err);
    }
};
