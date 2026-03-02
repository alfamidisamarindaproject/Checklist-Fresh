const URL_SCRIPT = 'https://script.google.com/macros/s/AKfycbz-IFfSFVGhl6jEbHdXeNvhwwEMAGrVGTzaQRz3ya2iah1xvRGdcjXQF6s_GBHl-dYx/exec';
const dataFoto = { dis: null, rep: null };

function setupImg(inputId, previewId, key) {
    document.getElementById(inputId).onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 800; 
                let w = img.width, h = img.height;
                if (w > h) { if (w > MAX_SIZE) { h *= MAX_SIZE / w; w = MAX_SIZE; } }
                else { if (h > MAX_SIZE) { w *= MAX_SIZE / h; h = MAX_SIZE; } }
                
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                
                const base64 = canvas.toDataURL('image/jpeg', 0.6); // Kompresi 60% agar super ringan
                dataFoto[key] = base64;
                document.getElementById(previewId).src = base64;
                document.getElementById(previewId).style.display = 'block';
                validate();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };
}

setupImg('in-dis', 'p-dis', 'dis');
setupImg('in-rep', 'p-rep', 'rep');

function validate() {
    const toko = document.getElementById('toko').value;
    const pic = document.getElementById('pic').value;
    document.getElementById('btn-submit').disabled = !(toko && pic && dataFoto.dis && dataFoto.rep);
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
        foto_display: dataFoto.dis,
        foto_repack: dataFoto.rep
    };

    try {
        await fetch(URL_SCRIPT, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(payload)
        });

        // Mode no-cors tidak bisa baca response, tapi kita beri jeda lalu refresh
        setTimeout(() => {
            Swal.fire('Berhasil!', 'Data terkirim.', 'success').then(() => location.reload());
        }, 2000);

    } catch (err) {
        Swal.fire('Error', 'Gagal kirim data.', 'error');
    }
};
