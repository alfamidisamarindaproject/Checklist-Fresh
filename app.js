const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwoz-Nw43oPupfnTxDvE5CQ4lqzZNPGfssmvuNMxkTu6rJwONMKDx5dhbCQ-iBAX0n9/exec';

const state = {
    displayBase64: null,
    repackBase64: null,
    markers: []
};

// Handle Input Display Foto
document.getElementById('display-trigger').onclick = (e) => {
    if (!state.displayBase64) document.getElementById('input-display').click();
    else handleMarker(e);
};

document.getElementById('input-display').onchange = function() {
    loadImage(this.files[0], 'display');
};

// Handle Input Repack Foto
document.getElementById('repack-trigger').onclick = () => {
    document.getElementById('input-repack').click();
};

document.getElementById('input-repack').onchange = function() {
    loadImage(this.files[0], 'repack');
};

function loadImage(file, type) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        state[`${type}Base64`] = e.target.result;
        document.getElementById(`${type}-placeholder`).style.display = 'none';
        document.getElementById(`${type}-wrapper`).style.display = 'block';
        document.getElementById(`${type}-img`).src = e.target.result;
        updateProgress();
    };
    reader.readAsDataURL(file);
}

function handleMarker(e) {
    const container = document.getElementById('display-trigger');
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const marker = document.createElement('div');
    marker.className = 'marker';
    marker.style.left = x + '%';
    marker.style.top = y + '%';
    marker.innerHTML = '✕';
    document.getElementById('display-wrapper').appendChild(marker);
    state.markers.push({x, y});
}

function updateProgress() {
    const isReady = document.getElementById('toko').value && 
                    document.getElementById('pic').value && 
                    state.displayBase64 && 
                    state.repackBase64;
    
    document.getElementById('btn-submit').disabled = !isReady;
    document.getElementById('fill-progress').style.width = isReady ? '100%' : '50%';
}

// Listen for inputs
['toko', 'pic'].forEach(id => {
    document.getElementById(id).oninput = updateProgress;
});

document.getElementById('btn-submit').onclick = async () => {
    Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    // Gabungkan Foto Display dengan Markers
    const finalDisplay = await processImageWithMarkers();

    const payload = {
        toko: document.getElementById('toko').value,
        pic: document.getElementById('pic').value,
        culling: document.getElementById('check-culling').checked,
        trimming: document.getElementById('check-trimming').checked,
        crisping: document.getElementById('check-crisping').checked,
        foto_display: finalDisplay,
        foto_repack: state.repackBase64,
        catatan: document.getElementById('catatan').value,
        jumlah_marker: state.markers.length
    };

    try {
        await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
        Swal.fire('Sukses!', 'Laporan monitoring terkirim.', 'success').then(() => location.reload());
    } catch (e) {
        Swal.fire('Error', 'Gagal mengirim data.', 'error');
    }
};

async function processImageWithMarkers() {
    const canvas = document.getElementById('canvas-process');
    const ctx = canvas.getContext('2d');
    const img = document.getElementById('display-img');
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    ctx.fillStyle = "#ED1C24";
    ctx.strokeStyle = "white";
    ctx.lineWidth = canvas.width * 0.005;
    const size = canvas.width * 0.03;

    state.markers.forEach(m => {
        const px = (m.x / 100) * canvas.width;
        const py = (m.y / 100) * canvas.height;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = `bold ${size}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("X", px, py + (size/3));
        ctx.fillStyle = "#ED1C24";
    });

    return canvas.toDataURL('image/jpeg', 0.7);
}
