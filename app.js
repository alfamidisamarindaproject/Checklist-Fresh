const URL_APP = 'https://script.google.com/macros/s/AKfycbz-IFfSFVGhl6jEbHdXeNvhwwEMAGrVGTzaQRz3ya2iah1xvRGdcjXQF6s_GBHl-dYx/exec'; 
const state = { foto_display: null, foto_repack: null };

function setupUploader(inputId, previewId, key) {
    document.getElementById(inputId).onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Kompresi resolusi
                let w = img.width, h = img.height;
                if (w > MAX_WIDTH) { h *= MAX_WIDTH / w; w = MAX_WIDTH; }
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                
                // Kompresi kualitas menjadi 60% agar pengiriman cepat
                const base64 = canvas.toDataURL('image/jpeg', 0.6);
                state[key] = base64;
                
                const preview = document.getElementById(previewId);
                preview.src = base64; preview.style.display = 'block';
                validate();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
}

setupUploader('in-dis', 'p-dis', 'foto_display');
setupUploader('in-rep', 'p-rep', 'foto_repack');

function validate() {
    const isReady = document.getElementById('toko').value && 
                    document.getElementById('pic').value && 
                    state.foto_display && state.foto_repack;
    document.getElementById('btn-submit').disabled = !isReady;
}

document.getElementById('btn-submit').onclick = async () => {
    Swal.fire({ title: 'Mengirim Laporan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

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
        // Menggunakan mode no-cors untuk bypass kendala keamanan browser
        await fetch(URL_APP, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });

        setTimeout(() => {
            Swal.fire('Berhasil!', 'Data GSheet dan Foto Drive terupdate.', 'success').then(() => location.reload());
        }, 2000);
    } catch (err) {
        Swal.fire('Gagal!', 'Cek koneksi internet.', 'error');
    }
};
