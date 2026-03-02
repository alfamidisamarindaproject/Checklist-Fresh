const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwoz-Nw43oPupfnTxDvE5CQ4lqzZNPGfssmvuNMxkTu6rJwONMKDx5dhbCQ-iBAX0n9/exec'; // Ganti dengan URL Google Apps Script

const fileInput = document.getElementById('file-input');
const cameraTrigger = document.getElementById('camera-trigger');
const previewImg = document.getElementById('preview-img');
const imageWrapper = document.getElementById('image-wrapper');
const placeholderUI = document.getElementById('placeholder-ui');
const instructionTap = document.getElementById('instruction-tap');
const btnSubmit = document.getElementById('btn-submit');
const fillProgress = document.getElementById('fill-progress');

let markers = [];

// 1. Trigger Kamera
cameraTrigger.addEventListener('click', (e) => {
    if (!previewImg.src || previewImg.src.includes('window')) {
        fileInput.click();
    } else {
        // Jika foto sudah ada, fungsi klik adalah untuk memberi tanda
        addMarker(e);
    }
});

// 2. Handle Foto Masuk
fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            placeholderUI.style.display = 'none';
            imageWrapper.style.display = 'block';
            instructionTap.style.display = 'block';
            cameraTrigger.style.border = 'none';
            updateProgress();
        }
        reader.readAsDataURL(file);
    }
});

// 3. Tambah Tanda Tidak Layak (X)
function addMarker(e) {
    const rect = cameraTrigger.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.style.left = x + '%';
    marker.style.top = y + '%';
    marker.innerHTML = '✕';
    imageWrapper.appendChild(marker);

    markers.push({ x, y });
    updateProgress();
}

// 4. Update Progress Bar & Validasi Button
function updateProgress() {
    let score = 0;
    if (document.getElementById('toko').value) score += 25;
    if (document.getElementById('pic').value) score += 25;
    if (previewImg.src && previewImg.src.length > 100) score += 50;
    
    fillProgress.style.width = score + '%';
    btnSubmit.disabled = score < 100;
}

// Listen to inputs for progress
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateProgress);
});

// 5. Submit Laporan
btnSubmit.addEventListener('click', async () => {
    Swal.fire({
        title: 'Mengirim Laporan...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const canvas = document.getElementById('canvas-hidden');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to image original size
    canvas.width = previewImg.naturalWidth;
    canvas.height = previewImg.naturalHeight;
    ctx.drawImage(previewImg, 0, 0);

    // Draw Markers on Final Image
    ctx.fillStyle = "#ED1C24";
    ctx.strokeStyle = "white";
    ctx.lineWidth = canvas.width * 0.01;
    const fontS = canvas.width * 0.05;
    ctx.font = `bold ${fontS}px Arial`;

    markers.forEach(m => {
        const posX = (m.x / 100) * canvas.width;
        const posY = (m.y / 100) * canvas.height;
        
        // Draw Circle
        ctx.beginPath();
        ctx.arc(posX, posY, fontS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw X
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("X", posX, posY + (fontS/3));
        ctx.fillStyle = "#ED1C24"; // reset
    });

    const finalImageData = canvas.toDataURL('image/jpeg', 0.7);

    const payload = {
        toko: document.getElementById('toko').value,
        pic: document.getElementById('pic').value,
        catatan: document.getElementById('catatan').value,
        foto: finalImageData,
        jumlah_temuan: markers.length
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        Swal.fire('Berhasil!', 'Laporan monitoring telah terkirim.', 'success')
            .then(() => location.reload());
            
    } catch (error) {
        Swal.fire('Error', 'Gagal terhubung ke server.', 'error');
    }
});
