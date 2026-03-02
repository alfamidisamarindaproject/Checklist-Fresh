// GANTI DENGAN URL /exec HASIL DEPLOY TERBARU
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-N3Kxo1Ny17gVlDGQS6RgixQT_1__TMWChImePZ-imjEBDrBMxPHfNEBGAF2K2Hb9/exec'; 

const photos = { dis: null, rep: null };

/**
 * Kompresi Gambar: Mengubah foto besar menjadi max 800px 
 * agar proses upload cepat & tidak timeout.
 */
function handleFile(inputId, previewId, key) {
    document.getElementById(inputId).onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
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
                
                const base64 = canvas.toDataURL('image/jpeg', 0.7);
                photos[key] = base64;
                
                const preview = document.getElementById(previewId);
                preview.src = base64;
                preview.style.display = 'block';
                validate();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
}

handleFile('in-dis', 'p-dis', 'dis');
handleFile('in-rep', 'p-rep', 'rep');

function validate() {
    const isOk = document.getElementById('toko').value && 
                 document.getElementById('pic').value && 
                 photos.dis && photos.rep;
    document.getElementById('btn-submit').disabled = !isOk;
}

document.getElementById('toko').oninput = validate;
document.getElementById('pic').oninput = validate;

document.getElementById('btn-submit').onclick = async () => {
    Swal.fire({ title: 'Mengirim...', text: 'Mengompresi & Mengunggah', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const payload = {
        toko: document.getElementById('toko').value,
        pic: document.getElementById('pic').value,
        culling: document.getElementById('culling').checked,
        trimming: document.getElementById('trimming').checked,
        crisping: document.getElementById('crisping').checked,
        foto_display: photos.dis,
        foto_repack: photos.rep
    };

    try {
        // MENGGUNAKAN METODE TEXT/PLAIN UNTUK BYPASS CORS
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });

        // Karena mode 'no-cors' tidak bisa membaca response, 
        // kita beri delay 2 detik lalu anggap sukses
        setTimeout(() => {
            Swal.fire('Berhasil!', 'Data tersimpan di GSheet.', 'success').then(() => location.reload());
        }, 2000);

    } catch (err) {
        Swal.fire('Gagal!', 'Cek koneksi internet.', 'error');
        console.error(err);
    }
};
